"""Memory usage helpers for request logging."""

from __future__ import annotations

import os
import platform
from typing import Any


def get_memory_usage_snapshot() -> dict[str, Any]:
    """Return process and system RAM usage without requiring optional packages."""

    psutil_snapshot = _get_psutil_snapshot()
    if psutil_snapshot:
        return psutil_snapshot

    process_rss_mb = _get_process_rss_mb()
    system_snapshot = _get_system_memory_snapshot()

    return {
        "process_rss_mb": process_rss_mb,
        **system_snapshot,
    }


def _get_psutil_snapshot() -> dict[str, Any] | None:
    try:
        import psutil
    except ImportError:
        return None

    process = psutil.Process(os.getpid())
    virtual_memory = psutil.virtual_memory()

    return {
        "process_rss_mb": _bytes_to_mb(process.memory_info().rss),
        "system_total_mb": _bytes_to_mb(virtual_memory.total),
        "system_available_mb": _bytes_to_mb(virtual_memory.available),
        "system_used_percent": round(virtual_memory.percent, 2),
    }


def _get_process_rss_mb() -> float | None:
    if platform.system() == "Windows":
        return _get_windows_process_rss_mb()

    return _get_linux_process_rss_mb()


def _get_system_memory_snapshot() -> dict[str, Any]:
    if platform.system() == "Windows":
        return _get_windows_system_memory_snapshot()

    return _get_linux_system_memory_snapshot()


def _get_linux_process_rss_mb() -> float | None:
    try:
        with open("/proc/self/status", encoding="utf-8") as status_file:
            for line in status_file:
                if line.startswith("VmRSS:"):
                    value_kb = float(line.split()[1])
                    return round(value_kb / 1024, 2)
    except OSError:
        return None

    return None


def _get_linux_system_memory_snapshot() -> dict[str, Any]:
    try:
        values = {}
        with open("/proc/meminfo", encoding="utf-8") as meminfo_file:
            for line in meminfo_file:
                key, value = line.split(":", 1)
                values[key] = float(value.strip().split()[0])

        total_mb = values["MemTotal"] / 1024
        available_mb = values.get("MemAvailable", values.get("MemFree", 0)) / 1024
        used_percent = ((total_mb - available_mb) / total_mb) * 100 if total_mb else None

        return {
            "system_total_mb": round(total_mb, 2),
            "system_available_mb": round(available_mb, 2),
            "system_used_percent": round(used_percent, 2) if used_percent is not None else None,
        }
    except (OSError, KeyError, ValueError):
        return {
            "system_total_mb": None,
            "system_available_mb": None,
            "system_used_percent": None,
        }


def _get_windows_process_rss_mb() -> float | None:
    try:
        import ctypes
        from ctypes import wintypes

        class ProcessMemoryCountersEx(ctypes.Structure):
            _fields_ = [
                ("cb", wintypes.DWORD),
                ("PageFaultCount", wintypes.DWORD),
                ("PeakWorkingSetSize", ctypes.c_size_t),
                ("WorkingSetSize", ctypes.c_size_t),
                ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                ("PagefileUsage", ctypes.c_size_t),
                ("PeakPagefileUsage", ctypes.c_size_t),
                ("PrivateUsage", ctypes.c_size_t),
            ]

        counters = ProcessMemoryCountersEx()
        counters.cb = ctypes.sizeof(ProcessMemoryCountersEx)

        ctypes.windll.kernel32.GetCurrentProcess.restype = wintypes.HANDLE
        ctypes.windll.psapi.GetProcessMemoryInfo.argtypes = [
            wintypes.HANDLE,
            ctypes.POINTER(ProcessMemoryCountersEx),
            wintypes.DWORD,
        ]
        ctypes.windll.psapi.GetProcessMemoryInfo.restype = wintypes.BOOL

        success = ctypes.windll.psapi.GetProcessMemoryInfo(
            ctypes.windll.kernel32.GetCurrentProcess(),
            ctypes.byref(counters),
            counters.cb,
        )
        if not success:
            return None

        return _bytes_to_mb(counters.WorkingSetSize)
    except (AttributeError, OSError):
        return None


def _get_windows_system_memory_snapshot() -> dict[str, Any]:
    try:
        import ctypes
        from ctypes import wintypes

        class MemoryStatusEx(ctypes.Structure):
            _fields_ = [
                ("dwLength", wintypes.DWORD),
                ("dwMemoryLoad", wintypes.DWORD),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]

        status = MemoryStatusEx()
        status.dwLength = ctypes.sizeof(MemoryStatusEx)

        success = ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status))
        if not success:
            raise OSError("GlobalMemoryStatusEx failed")

        return {
            "system_total_mb": _bytes_to_mb(status.ullTotalPhys),
            "system_available_mb": _bytes_to_mb(status.ullAvailPhys),
            "system_used_percent": round(float(status.dwMemoryLoad), 2),
        }
    except (AttributeError, OSError):
        return {
            "system_total_mb": None,
            "system_available_mb": None,
            "system_used_percent": None,
        }


def _bytes_to_mb(value: int | float) -> float:
    return round(value / (1024 * 1024), 2)
