import cv2
import mediapipe as mp
import time
import os
import json
import socket
import pynmea2
from geopy.geocoders import Nominatim

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SNAPSHOTS_DIR = os.path.join(SCRIPT_DIR, "snapshots")

if not os.path.exists(SNAPSHOTS_DIR):
    os.makedirs(SNAPSHOTS_DIR)

# ─── MediaPipe Setup ─────────────────────────────────────────────────
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.9)
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=2, min_detection_confidence=0.5)
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)
last_snapshot_time = 0

# ─── Phone GPS Config ────────────────────────────────────────────────
PHONE_IP = "192.0.0.2"   # 👈 Replace with your phone's IP address
PHONE_PORT = 8080            # 👈 Must match the port set in Share GPS app

gps_lat = None
gps_lng = None
gps_address = "Fetching location..."
gps_location = "Fetching location..."

# ─── GPS Functions ───────────────────────────────────────────────────

def get_gps_from_phone():
    """Connect to Share GPS app over TCP and parse NMEA sentences"""
    print(f"[PULSE] Connecting to phone GPS at {PHONE_IP}:{PHONE_PORT}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        sock.connect((PHONE_IP, PHONE_PORT))
        print("[PULSE] Connected to phone GPS!")

        buffer = ""
        attempts = 0

        while attempts < 50:  # Try up to 50 NMEA lines
            chunk = sock.recv(1024).decode('ascii', errors='replace')
            buffer += chunk
            lines = buffer.split('\n')
            buffer = lines[-1]  # keep incomplete line for next iteration

            for line in lines[:-1]:
                line = line.strip()
                if line.startswith('$GPRMC') or line.startswith('$GNRMC'):
                    try:
                        msg = pynmea2.parse(line)
                        if msg.latitude and msg.longitude and msg.latitude != 0:
                            sock.close()
                            print(f"[PULSE] GPS fix: {msg.latitude}, {msg.longitude}")
                            return float(msg.latitude), float(msg.longitude)
                    except pynmea2.ParseError:
                        pass
            attempts += 1

        sock.close()
        print("[PULSE] Could not get GPS fix from phone.")
        return None, None

    except socket.timeout:
        print(f"[PULSE] Timeout — is your phone on same WiFi and Share GPS running?")
        return None, None
    except ConnectionRefusedError:
        print(f"[PULSE] Connection refused — check IP and port in Share GPS app")
        return None, None
    except Exception as e:
        print(f"[PULSE] GPS error: {e}")
        return None, None

def reverse_geocode(lat, lng):
    """Convert coordinates to street address using OpenStreetMap (free)"""
    try:
        print("[PULSE] Reverse geocoding address...")
        geolocator = Nominatim(user_agent="aura_pulse_v1")
        location = geolocator.reverse(f"{lat}, {lng}", language='en', timeout=10)
        if location:
            print(f"[PULSE] Address: {location.address}")
            return location.address
    except Exception as e:
        print(f"[PULSE] Reverse geocode error: {e}")
    return "Address not found"

def get_location():
    global gps_lat, gps_lng, gps_address, gps_location

    lat, lng = 13.168926, 77.533843

    if lat and lng:
        gps_lat = lat
        gps_lng = lng
        gps_address = reverse_geocode(lat, lng)
        gps_location = f"{lat:.6f}, {lng:.6f} | {gps_address}"
    else:
        gps_location = "GPS unavailable — check phone connection"

    return gps_location

# Fetch location once at startup
print("[PULSE] Starting location fetch...")
gps_location = get_location()
print(f"[PULSE] Final location: {gps_location}")

# ─── Helper Functions ────────────────────────────────────────────────

def estimate_distance(bbox_width):
    known_width = 6.0
    focal_length = 500
    return int((known_width * focal_length) / bbox_width) if bbox_width > 0 else 0

def draw_status_box(frame, message, color):
    overlay = frame.copy()
    h, w, _ = frame.shape
    text_size = cv2.getTextSize(message, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3)[0]
    box_w = text_size[0] + 40
    box_h = text_size[1] + 30
    x1 = (w - box_w) // 2
    y1 = 30
    x2 = x1 + box_w
    y2 = y1 + box_h
    cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
    cv2.addWeighted(overlay, 0.8, frame, 0.2, 0, frame)
    cv2.putText(frame, message, (x1 + 20, y2 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)

def send_to_oracle(face_count, distance_cm, snapshot_path):
    payload = {
        "signal_type": "VISUAL_SOS",
        "face_count": face_count,
        "distance_cm": distance_cm,
        "snapshot": snapshot_path,
        "timestamp": time.time(),
        "location": {
            "latitude": gps_lat,
            "longitude": gps_lng,
            "address": gps_address
        }
    }
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
    alert_path = os.path.join(PROJECT_ROOT, "sos_alert.json")
    with open(alert_path, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"Person count : {face_count} | 🚨 SOS TRIGGERED | location in alert :\"{gps_lat}, {gps_lng}\"")

# ─── Main Loop ───────────────────────────────────────────────────────

while True:
    success, frame = cap.read()
    if not success:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape
    face_count = 0
    distance_cm = 0
    distance_display = ""
    sos_detected = False
    safe_detected = False

    # ── Face Detection ──────────────────────────────────────────────
    face_results = face_detection.process(frame_rgb)
    if face_results.detections:
        face_count = len(face_results.detections)
        for detection in face_results.detections:
            bbox = detection.location_data.relative_bounding_box
            x = int(bbox.xmin * width)
            y = int(bbox.ymin * height)
            w = int(bbox.width * width)
            h = int(bbox.height * height)

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, "Human", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            distance_cm = estimate_distance(w)
            distance_display = f"Distance: {distance_cm} cm"

    # ── Face Mesh ───────────────────────────────────────────────────
    mesh_results = face_mesh.process(frame_rgb)
    if mesh_results.multi_face_landmarks:
        for face_landmarks in mesh_results.multi_face_landmarks:
            x_list = [int(lm.x * width) for lm in face_landmarks.landmark]
            y_list = [int(lm.y * height) for lm in face_landmarks.landmark]
            cv2.rectangle(frame,
                          (min(x_list), min(y_list)),
                          (max(x_list), max(y_list)),
                          (0, 0, 255), 2)

    # ── Hand Detection ──────────────────────────────────────────────
    hand_results = hands.process(frame_rgb)
    if hand_results.multi_hand_landmarks and hand_results.multi_handedness:
        for hand_landmarks, handedness in zip(
                hand_results.multi_hand_landmarks,
                hand_results.multi_handedness):

            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            is_right = handedness.classification[0].label == "Right"

            fingers = [0, 0, 0, 0, 0]

            if is_right:
                fingers[0] = 1 if hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].x > \
                                   hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_IP].x else 0
            else:
                fingers[0] = 1 if hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].x < \
                                   hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_IP].x else 0

            finger_tips = [
                mp_hands.HandLandmark.INDEX_FINGER_TIP,
                mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
                mp_hands.HandLandmark.RING_FINGER_TIP,
                mp_hands.HandLandmark.PINKY_TIP
            ]
            for idx, tip_id in enumerate(finger_tips):
                fingers[idx + 1] = 1 if hand_landmarks.landmark[tip_id].y < \
                                         hand_landmarks.landmark[tip_id - 2].y else 0

            cv2.putText(frame, "".join(str(i) for i in fingers),
                        (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

            if fingers == [1, 1, 1, 1, 1]:
                sos_detected = True

            if fingers == [1, 1, 1, 0, 0]:
                safe_detected = True

    # ── Gesture Overlay ─────────────────────────────────────────────
    if sos_detected:
        draw_status_box(frame, "SOS", (0, 0, 255))
    elif safe_detected:
        draw_status_box(frame, "SAFE", (0, 180, 0))

    # ── HUD Text ────────────────────────────────────────────────────
    cv2.putText(frame, f"Person count : {face_count}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)

    if distance_display:
        cv2.putText(frame, distance_display,
                    (width - 250, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    # GPS at bottom — truncate if too long
    gps_display = f"location in alert :\"{gps_lat}, {gps_lng}\""
    gps_display = gps_display if len(gps_display) < 80 else gps_display[:77] + "..."
    cv2.putText(frame, gps_display,
                (10, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    # ── Snapshot + Alert trigger ──────────────────────────────────────
    current_time = time.time()
    if face_count > 0 and (current_time - last_snapshot_time > 5):
        snapshot_path = os.path.join(SNAPSHOTS_DIR, f"human_{int(current_time)}.jpg")
        cv2.imwrite(snapshot_path, frame)
        send_to_oracle(face_count, distance_cm, snapshot_path)
        last_snapshot_time = current_time

    cv2.imshow("AURA - PULSE", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
