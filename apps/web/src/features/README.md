# FSD - features layer

사용자가 앱에서 수행하는 주요 기능을 담습니다. 보통 특정 Entity와 연결됩니다.

- 모든 기능을 Feature로 만들 필요는 없습니다. 여러 페이지에서 재사용되는 경우에만 고려하세요.
- 예: 여러 에디터에서 같은 댓글 기능을 쓴다면, comments를 Feature로 만듭니다.
- Feature가 너무 많으면 중요한 기능을 찾기 어려워집니다.
  구성

- 📁 ui — 상호작용 UI(예: 폼)
- 📁 api — 기능 관련 API 요청
- 📁 model — 검증, 내부 상태
- 📁 config — Feature Flag

새로운 팀원이 들어왔을 때 Page와 Feature만 봐도 앱 기능 구조를 파악할 수 있도록 구성하세요.
