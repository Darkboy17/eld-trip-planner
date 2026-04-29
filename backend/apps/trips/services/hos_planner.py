"""Hours-of-service planner for generating trip events and required stops."""

from dataclasses import dataclass
from typing import Literal


DutyStatus = Literal["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY"]


@dataclass
class DutyEvent:
    """Represents a single duty event in the driver's schedule."""
    day: int
    start_hour: float
    end_hour: float
    status: DutyStatus
    location: str
    note: str


class HOSPlanner:
    """Simulate a driver's HOS timeline for a planned route distance."""

    # Planning assumptions are centralized here so compliance math stays auditable.
    MAX_DRIVING_PER_SHIFT = 11
    MAX_DUTY_WINDOW = 14
    BREAK_AFTER_DRIVING = 8
    BREAK_DURATION = 0.5
    RESET_DURATION = 10
    CYCLE_RESTART_DURATION = 34
    MAX_CYCLE = 70
    AVG_SPEED_MPH = 55
    FUEL_RANGE_MILES = 1000
    FUEL_DURATION = 0.5
    PICKUP_DURATION = 1
    DROPOFF_DURATION = 1

    def build_plan(
        self,
        distance_miles: float,
        current_cycle_used: float,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
    ) -> dict:
        """Return trip summary, duty events, and stop plan for the requested route."""

        total_drive_hours = distance_miles / self.AVG_SPEED_MPH

        events: list[DutyEvent] = []
        stops = []

        # Simulation state tracks trip clock, remaining driving, cycle usage, and fuel range.
        day = 1
        clock = 0.0
        drive_left = total_drive_hours
        cycle_used = current_cycle_used
        miles_since_fuel = 0.0
        has_picked_up = False

        if cycle_used + self.PICKUP_DURATION > self.MAX_CYCLE:
            events.append(
                DutyEvent(
                    day,
                    clock,
                    clock + self.CYCLE_RESTART_DURATION,
                    "OFF_DUTY",
                    current_location,
                    "34-hour restart",
                )
            )
            cycle_used = 0
            clock += self.CYCLE_RESTART_DURATION

            if clock >= 24:
                day += int(clock // 24)
                clock = clock % 24

        # Pickup is modeled as on-duty time before the driving simulation begins.
        events.append(
            DutyEvent(day, clock, clock + self.PICKUP_DURATION, "ON_DUTY", pickup_location, "Pickup")
        )
        clock += self.PICKUP_DURATION
        cycle_used += self.PICKUP_DURATION
        has_picked_up = True

        # Continue simulating shifts until the full route distance has been covered.
        while drive_left > 0:
            # A depleted 70-hour cycle requires a restart before more driving can occur.
            if cycle_used >= self.MAX_CYCLE:
                events.append(
                    DutyEvent(
                        day,
                        clock,
                        clock + self.CYCLE_RESTART_DURATION,
                        "OFF_DUTY",
                        current_location,
                        "34-hour restart",
                    )
                )
                cycle_used = 0
                clock += self.CYCLE_RESTART_DURATION

            # Keep clock within the current 24-hour log day.
            if clock >= 24:
                day += int(clock // 24)
                clock = clock % 24

            shift_start = clock
            driving_this_shift = 0.0
            continuous_driving = 0.0
            duty_this_shift = 0.0

            # Drive within the current shift until HOS, duty-window, or cycle limits stop it.
            while (
                drive_left > 0
                and driving_this_shift < self.MAX_DRIVING_PER_SHIFT
                and duty_this_shift < self.MAX_DUTY_WINDOW
                and cycle_used < self.MAX_CYCLE
            ):
                # Insert a 30-minute break when continuous driving reaches the break threshold.
                if continuous_driving >= self.BREAK_AFTER_DRIVING:
                    events.append(
                        DutyEvent(day, clock, clock + self.BREAK_DURATION, "ON_DUTY", "En route", "30-minute break")
                    )
                    stops.append({
                        "type": "rest_break",
                        "day": day,
                        "hour": round(clock, 2),
                        "duration_hours": self.BREAK_DURATION,
                    })
                    clock += self.BREAK_DURATION
                    duty_this_shift += self.BREAK_DURATION
                    cycle_used += self.BREAK_DURATION
                    continuous_driving = 0.0

                # Add fueling as on-duty time once the configured range is exhausted.
                if miles_since_fuel >= self.FUEL_RANGE_MILES:
                    events.append(
                        DutyEvent(day, clock, clock + self.FUEL_DURATION, "ON_DUTY", "Fuel stop", "Fueling")
                    )
                    stops.append({
                        "type": "fuel",
                        "day": day,
                        "hour": round(clock, 2),
                        "duration_hours": self.FUEL_DURATION,
                    })
                    clock += self.FUEL_DURATION
                    duty_this_shift += self.FUEL_DURATION
                    cycle_used += self.FUEL_DURATION
                    continuous_driving = 0.0
                    miles_since_fuel = 0

                # The next driving segment can only run until the first active limit is reached.
                time_until_break = self.BREAK_AFTER_DRIVING - continuous_driving
                available_drive = min(
                    drive_left,
                    self.MAX_DRIVING_PER_SHIFT - driving_this_shift,
                    self.MAX_DUTY_WINDOW - duty_this_shift,
                    self.MAX_CYCLE - cycle_used,
                    time_until_break,
                )

                if available_drive <= 0:
                    break

                start = clock
                end = clock + available_drive

                events.append(
                    DutyEvent(day, start, end, "DRIVING", "En route", "Driving")
                )

                miles_driven = available_drive * self.AVG_SPEED_MPH
                miles_since_fuel += miles_driven
                drive_left -= available_drive
                driving_this_shift += available_drive
                continuous_driving += available_drive
                duty_this_shift += available_drive
                cycle_used += available_drive
                clock = end

            # If the route is not complete, reset the shift before continuing.
            if drive_left > 0:
                if cycle_used >= self.MAX_CYCLE:
                    continue

                events.append(
                    DutyEvent(day, clock, clock + self.RESET_DURATION, "OFF_DUTY", "Rest location", "10-hour off-duty reset")
                )
                stops.append({
                    "type": "overnight_rest",
                    "day": day,
                    "hour": round(clock, 2),
                    "duration_hours": self.RESET_DURATION,
                })
                clock += self.RESET_DURATION

        # Drop-off closes the plan as on-duty time after all driving is complete.
        events.append(
            DutyEvent(day, clock, clock + self.DROPOFF_DURATION, "ON_DUTY", dropoff_location, "Drop-off")
        )
        cycle_used += self.DROPOFF_DURATION
        clock += self.DROPOFF_DURATION

        return {
            "total_distance_miles": round(distance_miles, 2),
            "estimated_drive_hours": round(total_drive_hours, 2),
            "estimated_total_trip_hours": round(clock + ((day - 1) * 24), 2),
            "cycle_used_after_trip": round(cycle_used, 2),
            "stops": stops,
            "events": [event.__dict__ for event in events],
        }
