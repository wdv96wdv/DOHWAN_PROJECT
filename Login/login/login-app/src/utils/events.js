import challenge from "../assets/img/challenge.jpg";
import hangangnight from "../assets/img/hangangnight.jpg";

export const events = [
  {
    id: 1,
    title: "한강 야간 러닝",
    date: "2025-11-01",
    location: "한강 여의도",
    image: hangangnight,
    shortDescription: "한강 야경을 즐기며 5km 러닝!",
    coords: [
      [37.521, 126.924],
      [37.525, 126.927],
      [37.522, 126.930],
    ],
  },
  {
    id: 2,
    title: "뚝섬 러닝 챌린지",
    date: "2025-11-15",
    location: "뚝섬유원지",
    image: challenge,
    shortDescription: "뚝섬 코스에서 10km 완주 도전!",
    coords: [
      [37.530, 127.065],
      [37.532, 127.070],
      [37.528, 127.075],
    ],
  },
];
