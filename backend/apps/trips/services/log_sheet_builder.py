"""Build printable daily log data from generated duty events."""

from collections import defaultdict


class LogSheetBuilder:
    """Convert duty events into per-day graph segments, totals, and remarks."""

    # Row numbers match the display order in the frontend ELD grid.
    STATUS_ROWS = {
        "OFF_DUTY": 1,
        "SLEEPER_BERTH": 2,
        "DRIVING": 3,
        "ON_DUTY": 4,
    }

    # Keep totals stable even when a day has no time in a specific status.
    STATUSES = ["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY"]

    def build_daily_logs(self, events: list[dict]) -> list[dict]:
        """Return one daily log object per day covered by the trip events."""

        split_events = self._split_events_at_midnight(events)

        # Grouping after splitting guarantees each daily log only contains in-day segments.
        grouped = defaultdict(list)
        for event in split_events:
            grouped[event["day"]].append(event)

        logs = []

        for day in sorted(grouped.keys()):
            day_events = sorted(grouped[day], key=lambda event: event["start_hour"])

            segments = []
            totals = {status: 0 for status in self.STATUSES}

            # Cursor fills gaps with off-duty time so every daily log totals 24 hours.
            cursor = 0.0

            for event in day_events:
                start = round(event["start_hour"], 2)
                end = round(event["end_hour"], 2)

                if start > cursor:
                    off_segment = {
                        "start": round(cursor, 2),
                        "end": start,
                        "status": "OFF_DUTY",
                        "row": self.STATUS_ROWS["OFF_DUTY"],
                        "location": "",
                        "note": "Off duty",
                    }
                    segments.append(off_segment)
                    totals["OFF_DUTY"] += start - cursor

                segment = {
                    "start": start,
                    "end": end,
                    "status": event["status"],
                    "row": self.STATUS_ROWS[event["status"]],
                    "location": event.get("location", ""),
                    "note": event.get("note", ""),
                }
                segments.append(segment)
                totals[event["status"]] += end - start
                cursor = max(cursor, end)

            if cursor < 24:
                segments.append({
                    "start": round(cursor, 2),
                    "end": 24,
                    "status": "OFF_DUTY",
                    "row": self.STATUS_ROWS["OFF_DUTY"],
                    "location": "",
                    "note": "Off duty",
                })
                totals["OFF_DUTY"] += 24 - cursor

            logs.append({
                "day": day,
                "totals": {
                    status: round(hours, 2)
                    for status, hours in totals.items()
                },
                "segments": segments,
                "remarks": [
                    f"{event.get('note', '')} - {event.get('location', '')}"
                    for event in day_events
                    if event.get("note") or event.get("location")
                ],
            })

        return logs

    def _split_events_at_midnight(self, events: list[dict]) -> list[dict]:
        """Split cross-midnight events into day-local event fragments."""

        split_events = []

        for event in events:
            # Absolute hours make midnight splitting consistent across multi-day trips.
            absolute_start = ((event["day"] - 1) * 24) + float(event["start_hour"])
            absolute_end = ((event["day"] - 1) * 24) + float(event["end_hour"])

            while absolute_start < absolute_end:
                current_day = int(absolute_start // 24) + 1
                day_start_absolute = (current_day - 1) * 24
                day_end_absolute = current_day * 24

                segment_end_absolute = min(absolute_end, day_end_absolute)

                split_events.append({
                    **event,
                    "day": current_day,
                    "start_hour": round(absolute_start - day_start_absolute, 2),
                    "end_hour": round(segment_end_absolute - day_start_absolute, 2),
                })

                absolute_start = segment_end_absolute

        return split_events
