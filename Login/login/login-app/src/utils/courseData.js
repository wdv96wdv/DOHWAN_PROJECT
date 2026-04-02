import beginner from "../assets/img/beginner.jpg";
import ten from "../assets/img/ten.jpg";
import half from "../assets/img/half.jpg";

export const COURSE_LIST = [
  // ===================== 서울 (SEOUL) =====================
  {
    id: 1,
    region: "Seoul",
    title: "석촌호수 루프 (Beginner)",
    description: "송파구 석촌호수를 따라 달리는 약 2.5km 초보자 맞춤형 코스입니다.",
    image: beginner,
    level: "Beginner",
    themeColor: "#00ffcc",
    center: [37.5098, 127.1002],
    coords: [
      [37.510775, 127.098332],
      [37.509290, 127.102850],
      [37.506967, 127.100734],
      [37.509119, 127.096543],
      [37.510775, 127.098332],
    ],
  },
  {
    id: 2,
    region: "Seoul",
    title: "여의도 한강공원 (10K Prep)",
    description: "여의도 한강공원에서 마포대교 구간을 왕복하는 정석적인 10km 코스입니다.",
    image: ten,
    level: "10K",
    themeColor: "#ff9900",
    center: [37.5278, 126.922],
    coords: [
      [37.5285, 126.933],
      [37.5275, 126.920],
      [37.5289, 126.910],
      [37.5295, 126.933],
    ],
  },
  {
    id: 3,
    region: "Seoul",
    title: "뚝섬~성수대교 (Half Marathon)",
    description: "뚝섬 한강공원에서 성수대교를 지나 잠실 방면으로 달리는 하프 마라톤 대비 코스.",
    image: half,
    level: "Half",
    themeColor: "#ff0066",
    center: [37.523, 127.075],
    coords: [
      [37.5295, 127.065],
      [37.5200, 127.080],
      [37.5170, 127.095],
      [37.5295, 127.065],
    ],
  },
  
  // ===================== 부산 (BUSAN) =====================
  {
    id: 4,
    region: "Busan",
    title: "광안리 해변 (Beginner)",
    description: "광안대교의 야경을 보며 달리는 평탄하고 아름다운 해변 3km 코스입니다.",
    image: beginner, // Using same images for now
    level: "Beginner",
    themeColor: "#00ccff",
    center: [35.1531, 129.1186],
    coords: [
      [35.155, 129.122],
      [35.153, 129.118],
      [35.150, 129.114],
      [35.148, 129.112],
    ],
  },
  {
    id: 5,
    region: "Busan",
    title: "해운대 달맞이길 (10K Prep)",
    description: "해운대 백사장부터 스포티한 오르막이 있는 달맞이길까지의 10km 특훈 코스.",
    image: ten,
    level: "10K",
    themeColor: "#ffbb00",
    center: [35.1610, 129.1666],
    coords: [
      [35.158, 129.160],
      [35.160, 129.168],
      [35.165, 129.175],
      [35.170, 129.180],
    ],
  },
  
  // ===================== 제주 (JEJU) =====================
  {
    id: 6,
    region: "Jeju",
    title: "제주 애월 해안도로 (Half Marathon)",
    description: "초보와 고수 모두가 사랑하는 끝없는 바다뷰, 애월 환상 자전거길 러닝 21km.",
    image: half,
    level: "Half",
    themeColor: "#cc00ff",
    center: [33.468, 126.324],
    coords: [
      [33.475, 126.340],
      [33.470, 126.330],
      [33.465, 126.320],
      [33.460, 126.310],
      [33.450, 126.290],
    ],
  }
];

export const REGION_LIST = ["All", "Seoul", "Gyeonggi", "Busan", "Jeju", "Gangwon"];
