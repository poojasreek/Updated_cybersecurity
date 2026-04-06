import datetime
import random

def generate_ppo_route(officer_id: int, shift_start: datetime.datetime, shift_end: datetime.datetime, danger_zones: list):
    """
    Simulates a Reinforcement Learning (PPO) agent determining the optimal patrol route.
    In a real app, this would use a trained model on historical crime data.
    Here we prioritize Red zones, then Yellow zones, and assign time slots.
    """
    print(f"🧠 [AI-AGENT] Initializing PPO route generation for Officer {officer_id}")
    
    if not danger_zones:
        # Fallback empty route
        return []

    # Sort zones: Red (High Risk) first, then Yellow (Medium Risk)
    sorted_zones = sorted(danger_zones, key=lambda z: 0 if z.risk_level == "Red" else 1)
    
    route_plan = []
    
    # Calculate total shift duration in hours
    shift_duration = (shift_end - shift_start).total_seconds() / 3600
    if shift_duration <= 0:
        shift_duration = 8 # Default to 8 hour shift if invalid
        
    num_zones_to_cover = min(len(sorted_zones), int(shift_duration / 2)) or 1
    hours_per_zone = shift_duration / num_zones_to_cover
    
    current_time = shift_start
    
    for i in range(num_zones_to_cover):
        zone = sorted_zones[i]
        
        # Add slight variation for "patrol area cover" coords
        lat_offset = random.uniform(-0.002, 0.002)
        lng_offset = random.uniform(-0.002, 0.002)
        
        slot_end_time = current_time + datetime.timedelta(hours=hours_per_zone)
        
        step = {
            "order": i + 1,
            "zone_id": zone.id,
            "zone_name": zone.name,
            "risk_level": zone.risk_level,
            "target_lat": zone.lat + lat_offset,
            "target_lng": zone.lng + lng_offset,
            "start_time": current_time.isoformat(),
            "end_time": slot_end_time.isoformat()
        }
        route_plan.append(step)
        
        # Advance time for next zone assignment
        current_time = slot_end_time
        
    print(f"✅ [AI-AGENT] PPO Route successfully planned: Covering {num_zones_to_cover} zones.")
    return route_plan
