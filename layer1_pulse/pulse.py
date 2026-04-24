import cv2
import mediapipe as mp
import time
import os
import json

if not os.path.exists("snapshots"):
    os.makedirs("snapshots")

mp_face_detection = mp.solutions.face_detection
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

face_detection = mp_face_detection.FaceDetection(
    model_selection=1, 
    min_detection_confidence=0.9
)
hands = mp_hands.Hands(
    max_num_hands=2, 
    min_detection_confidence=0.7
)

cap = cv2.VideoCapture(0)
last_snapshot_time = 0

def estimate_distance(bbox_width):
    if bbox_width <= 0:
        return 0
    return (6.0 * 500) / bbox_width

def send_to_oracle(face_count, distance_cm, snapshot_path):
    payload = {
        "signal_type": "VISUAL_SOS",
        "face_count": face_count,
        "distance_cm": distance_cm,
        "snapshot": snapshot_path,
        "timestamp": time.time()
    }
    with open("sos_alert.json", "w") as f:
        json.dump(payload, f)

def detect_fingers(hand_landmarks, is_right):
    tip_ids = [4, 8, 12, 16, 20]
    fingers = []
    
    # Thumb
    if is_right:
        fingers.append(1 if hand_landmarks.landmark[tip_ids[0]].x < hand_landmarks.landmark[tip_ids[0] - 1].x else 0)
    else:
        fingers.append(1 if hand_landmarks.landmark[tip_ids[0]].x > hand_landmarks.landmark[tip_ids[0] - 1].x else 0)
        
    # Other fingers
    for id in range(1, 5):
        fingers.append(1 if hand_landmarks.landmark[tip_ids[id]].y < hand_landmarks.landmark[tip_ids[id] - 2].y else 0)
        
    return fingers

while True:
    success, frame = cap.read()
    if not success:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape
    face_count = 0
    distance_cm = 0
    sos_detected = False

    # detect faces, draw boxes, count faces, estimate distance
    face_results = face_detection.process(frame_rgb)
    if face_results.detections:
        face_count = len(face_results.detections)
        for detection in face_results.detections:
            mp_drawing.draw_detection(frame, detection)
            bboxC = detection.location_data.relative_bounding_box
            bbox_width = int(bboxC.width * width)
            if bbox_width > 0:
                distance_cm = estimate_distance(bbox_width)

    # detect hands, get finger states
    hand_results = hands.process(frame_rgb)
    if hand_results.multi_hand_landmarks and hand_results.multi_handedness:
        for hand_landmarks, handedness in zip(hand_results.multi_hand_landmarks, hand_results.multi_handedness):
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            is_right = handedness.classification[0].label == 'Right'
            fingers = detect_fingers(hand_landmarks, is_right)
            if sum(fingers) == 5:
                sos_detected = True

    # if sos_detected: draw red SOS box, save snapshot every 3s, send payload
    if sos_detected:
        cv2.putText(frame, "SOS DETECTED", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.rectangle(frame, (0, 0), (width, height), (0, 0, 255), 10)
        current_time = time.time()
        if current_time - last_snapshot_time >= 3:
            snapshot_path = f"snapshots/sos_{int(current_time)}.jpg"
            cv2.imwrite(snapshot_path, frame)
            send_to_oracle(face_count, distance_cm, snapshot_path)
            last_snapshot_time = current_time

    cv2.imshow("AURA - PULSE", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
