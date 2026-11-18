// src/utils/courseData.js

export const REGION_TABS = [
  { key: "All", label: "전체" },
  { key: "Official", label: "🏆 대회 공식 코스" },
  { key: "Seoul", label: "서울" },
  { key: "Gyeonggi", label: "경기/인천" },
  { key: "Chungcheong", label: "충청/대전" },
  { key: "Yeongnam", label: "부산/대구/영남" },
  { key: "GangwonJeju", label: "강원/제주" }
];

export const DISTANCE_FILTERS = [
  { key: "All", label: "전체 거리" },
  { key: "Short", label: "5km 이하 (조깅/초보)" },
  { key: "Medium", label: "5~10km (인기/빌드업)" },
  { key: "Long", label: "10km 이상 (하프/LSD)" }
];

export const COURSE_LIST = [
  // ===================== 대회 공식 코스 (OFFICIAL MARATHON) =====================
  {
    id: 1,
    region: "Official",
    regionLabel: "서울 마포구/영등포구",
    title: "JTBC 서울마라톤 10K 공식 코스",
    locationName: "상암 월드컵경기장 평화의광장 출발",
    distanceKm: 10.0,
    distance: "10.0km",
    level: "10K",
    courseType: "편도 (Point to Point)",
    surface: "공도 아스팔트 로드",
    elevation: "양화대교 완만한 업힐 (고도차 18m)",
    description: "국내 최고 권위의 'JTBC 서울마라톤' 10K 공식 코스. 상암월드컵경기장을 출발하여 마포구청역, 양화대교를 건너 국회의사당을 돌아 여의도공원에 도착하는 황금 코스입니다.",
    tip: "5km 양화대교 진입 램프 구간에서 강바람과 미세한 경사가 있습니다. 여기서 오버페이스를 자제하고 케이던스를 유지하는 것이 서브50 달성의 핵심입니다.",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
    themeColor: "#2563eb",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#대회실전대비", "#물품보관소완비", "#초보환영"],
    center: [37.545, 126.905],
    coords: [
      [37.5682, 126.8972], [37.5630, 126.9010], [37.5580, 126.9050], [37.5510, 126.9090], [37.5440, 126.9110],
      [37.5380, 126.9125], [37.5320, 126.9150], [37.5270, 126.9200], [37.5240, 126.9240]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/월드컵경기장평화의광장",
      naver: "https://map.naver.com/v5/search/월드컵경기장평화의광장"
    }
  },
  {
    id: 2,
    region: "Official",
    regionLabel: "서울 종로구/송파구",
    title: "서울마라톤(동아) 하프/풀 하이라이트 코스",
    locationName: "광화문광장 세종대왕상 앞 출발",
    distanceKm: 21.1,
    distance: "21.1km (Half)",
    level: "Half",
    courseType: "편도 (Point to Point)",
    surface: "서울 도심 차도 전면 통제 공도",
    elevation: "청계천 평지 & 잠실대교 완경사 (고도차 22m)",
    description: "세계육상연맹(WA) 플래티넘 라벨 대회인 '서울마라톤'의 심장부! 역사적인 광화문 광장을 출발해 숭례문, 청계천을 거쳐 서울숲, 잠실종합운동장으로 향하는 전 세계 러너들의 드림 코스입니다.",
    tip: "15km 청계천 반환 구간까지는 힘을 아끼고, 17km 이후 잠실대교 진입로에서 맞바람을 고려해 보폭을 좁히고 피치 위주로 리듬을 타는 전략이 주효합니다.",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80",
    themeColor: "#dc2626",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#대회실전대비", "#물품보관소완비"],
    center: [37.545, 127.025],
    coords: [
      [37.5720, 126.9768], [37.5650, 126.9770], [37.5600, 126.9820], [37.5690, 127.0050], [37.5700, 127.0250],
      [37.5550, 127.0350], [37.5450, 127.0500], [37.5350, 127.0700], [37.5150, 127.0730]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/광화문광장",
      naver: "https://map.naver.com/v5/search/광화문광장"
    }
  },

  // ===================== 서울 (SEOUL) =====================
  {
    id: 3,
    region: "Seoul",
    regionLabel: "서울 송파구",
    title: "석촌호수 러닝 루프 (동호+서호)",
    locationName: "잠실역 2번 출구 / 송파나루역 방면",
    distanceKm: 2.5,
    distance: "2.5km",
    level: "Beginner",
    courseType: "루프 (Loop)",
    surface: "우레탄 트랙",
    elevation: "완벽한 평지 (고도차 3m)",
    description: "송파구 석촌호수를 따라 조성된 전 구간 탄성 우레탄 트랙. 롯데월드타워와 호수 뷰를 감상하며 초보자부터 페이스주 러너까지 편안하게 달릴 수 있는 서울 대표 러닝 성지입니다.",
    tip: "동호와 서호를 모두 돌면 정확히 약 2.5km입니다. 잠실역 지하철 락커나 인근 러닝스테이션에 짐을 보관하고 뛰기 좋습니다.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80",
    themeColor: "#059669",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#우레탄트랙", "#야경명소", "#물품보관소완비"],
    center: [37.5098, 127.1002],
    coords: [
      [37.5107, 127.1023], [37.5102, 127.1030], [37.5093, 127.1034], [37.5085, 127.1032], [37.5076, 127.1026],
      [37.5070, 127.1017], [37.5068, 127.1004], [37.5071, 127.0991], [37.5078, 127.0982], [37.5085, 127.0975],
      [37.5092, 127.0968], [37.5102, 127.0964], [37.5109, 127.0966], [37.5115, 127.0973], [37.5116, 127.0983],
      [37.5113, 127.0991], [37.5110, 127.1001], [37.5108, 127.1012], [37.5107, 127.1023]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/석촌호수",
      naver: "https://map.naver.com/v5/search/석촌호수"
    }
  },
  {
    id: 4,
    region: "Seoul",
    regionLabel: "서울 영등포구",
    title: "여의도 한강공원 ~ 마포대교 10K 코스",
    locationName: "여의나루역 2번 출구 앞 러너스테이션",
    distanceKm: 10.0,
    distance: "10.0km",
    level: "10K",
    courseType: "왕복 (Out & Back)",
    surface: "아스팔트 / 우레탄 보행로",
    elevation: "평지 (고도차 5m 이내)",
    description: "여의나루역 한강 러너스테이션을 기점으로 국회의사당 뒤편을 지나 마포대교와 원효대교 사이를 왕복하는 10km 정석 코스입니다. 시원한 강바람과 탁 트인 시야로 10K PB 달성에 최적화되어 있습니다.",
    tip: "여의나루역사 내 러너스테이션에 무료 탈의실과 락커가 구비되어 있습니다. 주말 낮에는 자전거와 보행자 분리구간을 엄수해 주세요.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
    themeColor: "#d97706",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#야경명소", "#물품보관소완비", "#대회실전대비"],
    center: [37.5273, 126.932],
    coords: [
      [37.5318, 126.9382], [37.5305, 126.9360], [37.5292, 126.9335], [37.5281, 126.9310], [37.5273, 126.9285],
      [37.5266, 126.9260], [37.5259, 126.9235], [37.5253, 126.9210], [37.5248, 126.9185], [37.5244, 126.9160],
      [37.5241, 126.9135], [37.5240, 126.9110], [37.5242, 126.9085], [37.5246, 126.9060], [37.5253, 126.9040],
      [37.5261, 126.9025], [37.5270, 126.9015], [37.5279, 126.9010], [37.5288, 126.9012], [37.5296, 126.9382]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/여의나루역",
      naver: "https://map.naver.com/v5/search/여의나루역"
    }
  },
  {
    id: 5,
    region: "Seoul",
    regionLabel: "서울 서초구/용산구",
    title: "반포 한강공원 ~ 잠수교 달빛 야경 루프",
    locationName: "고속터미널역 8-1번 출구 / 세빛섬 방면",
    distanceKm: 6.0,
    distance: "6.0km",
    level: "10K",
    courseType: "루프 (Loop)",
    surface: "아스팔트 & 데크로드",
    elevation: "완만한 잠수교 경사 (고도차 12m)",
    description: "서울에서 러닝 크루들이 가장 많이 모이는 나이트 러닝의 심장. 세빛섬과 달빛무지개분수를 보며 잠수교를 건너 강북 이촌 한강공원을 거쳐 돌아오는 환상적인 야경 코스입니다.",
    tip: "잠수교는 보행자/러너 전용 차로가 분리되어 있어 매우 안전합니다. 저녁 분수 가동 시간에 맞춰 달리면 멋진 야경을 즐길 수 있습니다.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    themeColor: "#9333ea",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#야경명소", "#초보환영", "#대회실전대비"],
    center: [37.5115, 126.996],
    coords: [
      [37.5090, 126.9940], [37.5115, 126.9955], [37.5140, 126.9968], [37.5165, 126.9975], [37.5190, 126.9980],
      [37.5210, 126.9982], [37.5235, 126.9984], [37.5245, 126.9950], [37.5240, 126.9910], [37.5220, 126.9880],
      [37.5195, 126.9860], [37.5160, 126.9870], [37.5130, 126.9890], [37.5100, 126.9920], [37.5090, 126.9940]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/반포한강공원",
      naver: "https://map.naver.com/v5/search/반포한강공원"
    }
  },
  {
    id: 6,
    region: "Seoul",
    regionLabel: "서울 중구/용산구",
    title: "남산 북측순환로 업힐 특훈 코스",
    locationName: "국립극장 해오름극장 앞 / 동대입구역 6번 출구",
    distanceKm: 7.5,
    distance: "7.5km",
    level: "Half",
    courseType: "왕복 (Out & Back)",
    surface: "친환경 천연 탄성 포장로",
    elevation: "업힐 훈련 (고도차 85m)",
    description: "차량 진입이 전면 통제된 보행자 전용길로 울창한 숲과 남산타워를 보며 뛸 수 있습니다. 지속적인 완경사와 헤어핀 코스로 하체 지구력과 심폐지구력을 기르는 최고의 마라톤 언덕 훈련지입니다.",
    tip: "차량 및 자전거 진입이 금지되어 러너에게 가장 안전합니다. 식수대와 화장실이 1.5km 간격으로 잘 갖춰져 있으며 여름철에도 그늘이 많습니다.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
    themeColor: "#0284c7",
    amenities: {
      toilet: true,
      water: true,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#업힐훈련", "#우레탄트랙", "#대회실전대비"],
    center: [37.552, 126.995],
    coords: [
      [37.5520, 127.0005], [37.5535, 126.9980], [37.5550, 126.9950], [37.5562, 126.9920], [37.5570, 126.9885],
      [37.5565, 126.9850], [37.5555, 126.9820], [37.5540, 126.9800], [37.5530, 126.9810], [37.5545, 126.9835],
      [37.5560, 126.9870], [37.5555, 126.9910], [37.5540, 126.9950], [37.5525, 126.9985], [37.5520, 127.0005]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/국립극장",
      naver: "https://map.naver.com/v5/search/국립극장"
    }
  },
  {
    id: 7,
    region: "Seoul",
    regionLabel: "서울 송파구/강동구",
    title: "올림픽공원 평화의 문 5K 파크런",
    locationName: "몽촌토성역 1번 출구 / 한성백제역",
    distanceKm: 5.0,
    distance: "5.0km",
    level: "Beginner",
    courseType: "루프 (Loop)",
    surface: "아스팔트 & 흙길 잔디 둘레길",
    elevation: "완만한 몽촌토성 둔덕 (고도차 18m)",
    description: "올림픽공원 평화의 문 광장을 시작으로 나홀로나무, 몽촌토성 언덕을 도는 5km 도심 속 힐링 코스. 봄가을 단풍과 계절 꽃이 아름다워 주말 러닝 모임으로 인기가 높습니다.",
    tip: "평화의 문 주변 광장이 넓어 스트레칭하기에 이상적입니다. 8호선 몽촌토성역과 9호선 한성백제역이 바로 연결되어 접근성이 뛰어납니다.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    themeColor: "#16a34a",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#야경명소", "#물품보관소완비"],
    center: [37.520, 127.121],
    coords: [
      [37.5165, 127.1130], [37.5185, 127.1155], [37.5205, 127.1180], [37.5230, 127.1210], [37.5245, 127.1245],
      [37.5235, 127.1280], [37.5210, 127.1305], [37.5180, 127.1290], [37.5160, 127.1250], [37.5145, 127.1200],
      [37.5150, 127.1160], [37.5165, 127.1130]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/올림픽공원평화의문",
      naver: "https://map.naver.com/v5/search/올림픽공원평화의문"
    }
  },

  // ===================== 경기 / 인천 (GYEONGGI / INCHEON) =====================
  {
    id: 8,
    region: "Gyeonggi",
    regionLabel: "경기 고양시",
    title: "일산 호수공원 4.8K 호수둘레 일주로",
    locationName: "정발산역 1번 출구 / 일산호수공원 안내소",
    distanceKm: 4.8,
    distance: "4.8km",
    level: "Beginner",
    courseType: "루프 (Loop)",
    surface: "보행로 포장 및 전용 산책로",
    elevation: "완벽한 평지 (고도차 2m)",
    description: "동양 최대 규모의 인공호수를 품은 일산 호수공원을 한 바퀴 완전히 도는 4.8km 루프. 자전거 도로와 보행자 도로가 완벽히 분리되어 있어 안전하고 쾌적하게 페이스를 유지할 수 있습니다.",
    tip: "중간에 다리를 건너 쇼트컷(2.8km)을 할 수도 있습니다. 100m마다 거리 표지판이 바닥에 설치되어 있어 인터벌과 템포런에 매우 유용합니다.",
    image: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80",
    themeColor: "#059669",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#우레탄트랙", "#물품보관소완비"],
    center: [37.658, 126.764],
    coords: [
      [37.6620, 126.7580], [37.6600, 126.7600], [37.6575, 126.7625], [37.6550, 126.7660], [37.6535, 126.7700],
      [37.6555, 126.7725], [37.6585, 126.7700], [37.6610, 126.7665], [37.6630, 126.7620], [37.6620, 126.7580]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/일산호수공원",
      naver: "https://map.naver.com/v5/search/일산호수공원"
    }
  },
  {
    id: 9,
    region: "Gyeonggi",
    regionLabel: "경기 수원시",
    title: "수원 광교호수공원 신대·원천 더블루프",
    locationName: "광교중앙역 4번 출구 / 신대호수 주차장",
    distanceKm: 6.5,
    distance: "6.5km",
    level: "10K",
    courseType: "루프 (Loop)",
    surface: "수변 데크로드 및 아스콘",
    elevation: "완만한 둔덕 (고도차 15m)",
    description: "원천호수와 신대호수 두 개의 큰 호수와 화려한 주상복합 시티 스카이라인을 조망하며 달리는 수도권 남부 최고의 야경 러닝 코스입니다.",
    tip: "밤 11시까지 수변 산책로 가로등과 조명이 켜져 있어 늦은 밤 퇴근 후 나이트러닝에 안성맞춤입니다.",
    image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80",
    themeColor: "#7c3aed",
    amenities: {
      toilet: true,
      water: true,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#야경명소", "#초보환영"],
    center: [37.283, 127.065],
    coords: [
      [37.2880, 127.0580], [37.2855, 127.0610], [37.2820, 127.0640], [37.2790, 127.0670], [37.2810, 127.0710],
      [37.2845, 127.0700], [37.2875, 127.0660], [37.2890, 127.0615], [37.2880, 127.0580]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/광교호수공원",
      naver: "https://map.naver.com/v5/search/광교호수공원"
    }
  },
  {
    id: 10,
    region: "Gyeonggi",
    regionLabel: "인천 연수구",
    title: "인천 송도 센트럴파크 해수공원 3.8K",
    locationName: "센트럴파크역 3번 출구 앞",
    distanceKm: 3.8,
    distance: "3.8km",
    level: "Beginner",
    courseType: "루프 (Loop)",
    surface: "보행자 전용 보도블록 & 우레탄",
    elevation: "평지 (고도차 3m)",
    description: "국내 최초의 해수공원 주변 미래도시 고층빌딩 사이를 달리는 코스. 바닷물이 흐르는 수로 옆으로 바람이 시원하고 바닥이 잘 정돈되어 있습니다.",
    tip: "송도 트라이볼 앞 광장에서 가벼운 웜업 후 출발하면 좋습니다. 한 바퀴 3.8km, 두 바퀴 7.6km로 거리 조절이 쉽습니다.",
    image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=800&q=80",
    themeColor: "#0284c7",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#야경명소", "#물품보관소완비"],
    center: [37.393, 126.634],
    coords: [
      [37.3965, 126.6300], [37.3940, 126.6325], [37.3915, 126.6350], [37.3895, 126.6390], [37.3910, 126.6410],
      [37.3935, 126.6380], [37.3960, 126.6350], [37.3975, 126.6320], [37.3965, 126.6300]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/송도센트럴파크",
      naver: "https://map.naver.com/v5/search/송도센트럴파크"
    }
  },

  // ===================== 충청 / 대전 (CHUNGCHEONG / DAEJEON) =====================
  {
    id: 11,
    region: "Chungcheong",
    regionLabel: "대전 유성구/서구",
    title: "대전 엑스포 갑천 수변 8K 템포런",
    locationName: "엑스포다리 / 한빛탑 남문광장",
    distanceKm: 8.0,
    distance: "8.0km",
    level: "10K",
    courseType: "왕복 (Out & Back)",
    surface: "우레탄 & 포장 수변로",
    elevation: "평지 (고도차 4m)",
    description: "대전 러너들의 심장 갑천 수변로! 엑스포다리와 한빛탑, 신세계백화점의 야경을 끼고 곧게 뻗은 하천길을 달리는 8km 코스로 페이스 훈련에 최적입니다.",
    tip: "남문광장 쪽에 화장실과 편의점이 모여 있습니다. 여름철에는 엑스포다리 음악분수와 함께 달릴 수 있습니다.",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    themeColor: "#ea580c",
    amenities: {
      toilet: true,
      water: true,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#야경명소", "#우레탄트랙", "#대회실전대비"],
    center: [36.374, 127.386],
    coords: [
      [36.3810, 127.3750], [36.3780, 127.3800], [36.3750, 127.3850], [36.3720, 127.3900], [36.3685, 127.3950],
      [36.3650, 127.3980], [36.3685, 127.3950], [36.3720, 127.3900], [36.3750, 127.3850], [36.3810, 127.3750]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/엑스포과학공원",
      naver: "https://map.naver.com/v5/search/엑스포과학공원"
    }
  },

  // ===================== 영남 / 부산 / 대구 (YEONGNAM / BUSAN / DAEGU) =====================
  {
    id: 12,
    region: "Yeongnam",
    regionLabel: "부산 수영구",
    title: "부산 광안리 해변 ~ 동백섬 오션뷰 5.5K",
    locationName: "금련산역 1번 출구 / 만남의광장",
    distanceKm: 5.5,
    distance: "5.5km",
    level: "Beginner",
    courseType: "왕복 (Out & Back)",
    surface: "해변 보행자 전용 보도",
    elevation: "평지 (고도차 5m)",
    description: "광안대교의 찬란한 불빛을 파도 소리와 함께 정면으로 마주하며 달리는 부산 대표 오션뷰 코스. 전국 러너들이 부산 여행 때 꼭 달리는 필수 러닝 버킷리스트입니다.",
    tip: "바닷바람이 있어 겨울이나 야간에는 윈드브레이커를 추천합니다. 해변가를 따라 24시간 편의점과 공중화장실이 잘 마련되어 있습니다.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    themeColor: "#0284c7",
    amenities: {
      toilet: true,
      water: true,
      locker: true,
      parking: true,
      nightLight: true
    },
    tags: ["#초보환영", "#야경명소", "#물품보관소완비"],
    center: [35.1531, 129.1186],
    coords: [
      [35.155, 129.122], [35.153, 129.118], [35.150, 129.114], [35.148, 129.112], [35.146, 129.108]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/광안리해수욕장",
      naver: "https://map.naver.com/v5/search/광안리해수욕장"
    }
  },
  {
    id: 13,
    region: "Yeongnam",
    regionLabel: "대구 중구/수성구",
    title: "대구 신천 수변 러닝로드 10K",
    locationName: "대봉교역 / 신천둔치 야외공연장",
    distanceKm: 10.0,
    distance: "10.0km",
    level: "10K",
    courseType: "왕복 (Out & Back)",
    surface: "우레탄 탄성 포장로",
    elevation: "평지 (고도차 5m)",
    description: "대구 도심을 가로지르는 신천 강변을 따라 신천동로와 희망교를 왕복하는 10km 장거리 훈련 코스. 대구국제마라톤을 준비하는 마스터즈 러너들의 주 훈련지입니다.",
    tip: "대봉교 주변에 간이 헬스기구와 음수대가 있으며, 신천 좌안/우안 모두 러닝로드가 잘 닦여 있습니다.",
    image: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=800&q=80",
    themeColor: "#c026d3",
    amenities: {
      toilet: true,
      water: true,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#우레탄트랙", "#대회실전대비"],
    center: [35.857, 128.608],
    coords: [
      [35.8750, 128.6020], [35.8680, 128.6050], [35.8600, 128.6080], [35.8520, 128.6110], [35.8450, 128.6140],
      [35.8520, 128.6110], [35.8600, 128.6080], [35.8680, 128.6050], [35.8750, 128.6020]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/대봉교",
      naver: "https://map.naver.com/v5/search/대봉교"
    }
  },

  // ===================== 강원 / 제주 (GANGWON / JEJU) =====================
  {
    id: 14,
    region: "GangwonJeju",
    regionLabel: "강원 춘천시",
    title: "춘천 의암호 공지천 수변 10K 코스",
    locationName: "공지천 조각공원 주차장 앞",
    distanceKm: 10.0,
    distance: "10.0km",
    level: "10K",
    courseType: "왕복 (Out & Back)",
    surface: "아스팔트 & 수변 데크로드",
    elevation: "완만한 호숫길 (고도차 8m)",
    description: "대한민국 3대 마라톤 '조선일보 춘천마라톤'의 호반 정취를 느낄 수 있는 코스. 가을철 물안개와 호수에 비친 삼악산 절경을 바라보며 시원하게 질주할 수 있습니다.",
    tip: "아침 물안개가 피어오르는 새벽 러닝에 가장 매력적입니다. 코스 중간마다 전망 데크 쉼터가 있습니다.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    themeColor: "#ea580c",
    amenities: {
      toilet: true,
      water: true,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#대회실전대비", "#초보환영"],
    center: [37.868, 127.712],
    coords: [
      [37.8650, 127.7180], [37.8680, 127.7120], [37.8720, 127.7050], [37.8760, 127.6980], [37.8800, 127.6920],
      [37.8760, 127.6980], [37.8720, 127.7050], [37.8680, 127.7120], [37.8650, 127.7180]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/공지천조각공원",
      naver: "https://map.naver.com/v5/search/공지천조각공원"
    }
  },
  {
    id: 15,
    region: "GangwonJeju",
    regionLabel: "제주 제주시",
    title: "제주 애월 환상 해안도로 12K LSD",
    locationName: "애월 한담해변 주차장",
    distanceKm: 12.0,
    distance: "12.0km",
    level: "Half",
    courseType: "왕복 (Out & Back)",
    surface: "아스팔트 로드 & 자전거도로",
    elevation: "해안 구릉 기복 (고도차 28m)",
    description: "에메랄드빛 제주 서쪽 바다를 왼쪽에 두고 달리는 환상적인 해안도로. 적당한 오르내림 구릉과 바닷바람 저항 훈련이 결합된 하프·풀코스 LSD 대비 명소입니다.",
    tip: "낮에는 자외선 차단제와 캡 모자가 필수입니다. 해 질 무렵 일몰(Sunset) 러닝을 강력 추천합니다.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    themeColor: "#9333ea",
    amenities: {
      toilet: true,
      water: false,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: ["#대회실전대비", "#야경명소"],
    center: [33.468, 126.324],
    coords: [
      [33.475, 126.340], [33.470, 126.330], [33.465, 126.320], [33.460, 126.310], [33.450, 126.290],
      [33.460, 126.310], [33.465, 126.320], [33.470, 126.330], [33.475, 126.340]
    ],
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/애월한담해변",
      naver: "https://map.naver.com/v5/search/애월한담해변"
    }
  }
];

export const REGION_LIST = REGION_TABS.map(t => t.key);
