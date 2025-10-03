# FSD - app layer
앱 전역에서 동작하는 환경 설정과 공용 로직을 관리하는 Layer입니다.
예를 들어, 라우터 설정, 전역 상태 관리, 글로벌 스타일, 진입점 설정 등 앱 전체에 영향을 주는 코드를 둡니다.

* shared처럼 Slice 없이 Segment로 구성합니다.
* 대표 Segment:
    * 📁 routes — Router 설정
    * 📁 store — Global State Store 설정
    * 📁 styles — Global Style
    * 📁 entrypoint — Application Entry Point와 Framework 설정