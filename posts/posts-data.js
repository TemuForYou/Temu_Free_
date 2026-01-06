/* posts/posts-data.js
   - index.html에서 자동 로드: <script src="./posts/posts-data.js"></script>
   - 반드시 window.TFY_DATA 이름으로 내보내야 합니다.
*/

window.TFY_DATA = {
  // ✅ 쿠폰 6개(코드 + 링크) 고정 세트
  coupons: [
    {
      title: "150,000원 쿠폰 묶음",
      tag: "신규 앱 사용자",
      code: "aak74594",
      link: "https://temu.to/m/uotsq20netz"
    },
    {
      title: "사은품 0원",
      tag: "신규 앱 사용자",
      code: "frq027981",
      link: "https://temu.to/m/u3ia9bomcaw"
    },
    {
      title: "30% 할인",
      tag: "신규 앱 사용자",
      code: "acr804202",
      link: "https://temu.to/m/u3ckk6z4eku"
    },
    {
      title: "특별 세일",
      tag: "신규 앱 사용자",
      code: "ack263361",
      link: "https://temu.to/m/u6ndc7zl0v8"
    },
    {
      title: "SAVE BIG",
      tag: "모든 사용자",
      code: "frw419209",
      link: "https://temu.to/m/u0zwrhwzccf"
    },
    {
      title: "추가 혜택",
      tag: "모든 사용자",
      code: "alf468043",
      link: "https://temu.to/k/qgzxbhz73coe"
    }
  ],

  // ✅ 4개 카테고리 × 5개 글 = 총 20개(미리 목록만)
  // - posts 폴더에 실제 파일: posts/<slug>.html 로 업로드하면 자동 연결
  // - ready: true/false는 뱃지 표시용(원하시면 전부 true로 바꿔드릴 수 있어요)
  categories: [
    {
      id: "benefit",
      emoji: "🎁",
      name: "혜택 · 쿠폰",
      posts: [
        {
          title: "테무 쿠폰코드 입력, 순서 하나로 적용률이 갈립니다",
          slug: "temu-coupon-code-input-order",
          ready: false
        },
        {
          title: "테무 쿠폰이 안 먹힐 때, 계정 조건부터 먼저 확인하세요",
          slug: "temu-coupon-not-working-account-check",
          ready: false
        },
        {
          title: "테무 신규회원 혜택, ‘처음’에만 열리는 구간 정리",
          slug: "temu-new-user-benefit-open-window",
          ready: false
        },
        {
          title: "테무 쿠폰·크레딧 중복, 되는 조합/안 되는 조합 한 번에 정리",
          slug: "temu-coupon-credit-stack-rules",
          ready: false
        },
        {
          title: "테무 특별 세일, 실제로 가격이 내려가는 타이밍은 따로 있습니다",
          slug: "temu-special-sale-timing",
          ready: false
        }
      ]
    },

    {
      id: "payment",
      emoji: "💳",
      name: "결제 · 계정",
      posts: [
        {
          title: "테무 결제 오류 발생 시, 대부분 이 단계에서 막힙니다",
          slug: "temu-payment-error-most-stuck",
          ready: false
        },
        {
          title: "테무 결제 실패가 반복될 때, 카드보다 ‘이 설정’이 원인인 경우",
          slug: "temu-payment-fail-setting-root",
          ready: false
        },
        {
          title: "테무 결제는 됐는데 주문이 안 뜰 때, 먼저 확인할 3가지",
          slug: "temu-payment-approved-no-order-3checks",
          ready: false
        },
        {
          title: "테무 결제 오류, 앱/웹 차이로 생기는 대표 케이스",
          slug: "temu-payment-app-web-differences",
          ready: false
        },
        {
          title: "테무 결제 오류 예방, 초보가 꼭 해두면 좋은 기본 점검 5가지",
          slug: "temu-payment-prevent-basic-5",
          ready: false
        }
      ]
    },

    {
      id: "shipping",
      emoji: "🚚",
      name: "배송 · 통관",
      posts: [
        {
          title: "테무 통관번호 한 글자 때문에 배송이 멈춘 사례, 실제로 가장 많았습니다",
          slug: "temu-customs-code-one-letter-shipping-stop",
          ready: false
        },
        {
          title: "테무 배송이 멈춘 것처럼 보일 때, 정상 대기/문제 상황 구분법",
          slug: "temu-shipping-stuck-normal-vs-issue",
          ready: false
        },
        {
          title: "테무 배송조회가 안 맞을 때, 업데이트 지연 때문에 생기는 착시",
          slug: "temu-tracking-delay-illusion",
          ready: false
        },
        {
          title: "테무 통관 단계에서 오래 걸릴 때, 확인해야 할 화면 3곳",
          slug: "temu-customs-long-check-3screens",
          ready: false
        },
        {
          title: "테무 주소 입력 실수, 수정 가능/불가가 갈리는 기준",
          slug: "temu-address-fix-possible-rule",
          ready: false
        }
      ]
    },

    {
      id: "refund",
      emoji: "🧾",
      name: "환불 · 고객센터",
      posts: [
        {
          title: "테무 환불이 늦어질 때, 처리 속도가 갈리는 요청 방식",
          slug: "temu-refund-speed-request-method",
          ready: false
        },
        {
          title: "테무 환불 상태가 멈춘 것처럼 보일 때, 실제 진행 흐름",
          slug: "temu-refund-status-real-flow",
          ready: false
        },
        {
          title: "테무 환불이 크레딧으로 들어올 때, 반드시 알아야 할 포인트",
          slug: "temu-refund-credit-must-know",
          ready: false
        },
        {
          title: "테무 반품 없이 환불되는 케이스, 조건과 예외 정리",
          slug: "temu-refund-without-return-conditions",
          ready: false
        },
        {
          title: "테무 고객센터 답이 늦을 때, 문의가 통과되는 메시지 작성법",
          slug: "temu-cs-message-pass-format",
          ready: false
        }
      ]
    }
  ]
};
