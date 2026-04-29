from django.test import TestCase

from .services.hos_planner import HOSPlanner


class HOSPlannerTests(TestCase):
    """Regression coverage for planner loop termination and HOS stops."""

    def test_high_current_cycle_usage_triggers_cycle_restart(self):
        planner = HOSPlanner()

        plan = planner.build_plan(
            distance_miles=330,
            current_cycle_used=65,
            current_location="Dallas, TX",
            pickup_location="Fort Worth, TX",
            dropoff_location="Austin, TX",
        )

        notes = [event["note"] for event in plan["events"]]

        self.assertIn("34-hour restart", notes)
        self.assertEqual(plan["estimated_total_trip_hours"], 42)
        self.assertLess(plan["cycle_used_after_trip"], planner.MAX_CYCLE)

    def test_full_current_cycle_restarts_before_pickup(self):
        planner = HOSPlanner()

        plan = planner.build_plan(
            distance_miles=55,
            current_cycle_used=70,
            current_location="Dallas, TX",
            pickup_location="Fort Worth, TX",
            dropoff_location="Austin, TX",
        )

        self.assertEqual(plan["events"][0]["note"], "34-hour restart")
        self.assertEqual(plan["events"][1]["note"], "Pickup")

    def test_break_after_eight_hours_is_not_repeated_without_more_driving(self):
        planner = HOSPlanner()

        plan = planner.build_plan(
            distance_miles=500,
            current_cycle_used=0,
            current_location="Dallas, TX",
            pickup_location="Fort Worth, TX",
            dropoff_location="Houston, TX",
        )

        rest_breaks = [
            stop
            for stop in plan["stops"]
            if stop["type"] == "rest_break"
        ]

        self.assertEqual(len(rest_breaks), 1)
