# FOMA (Feature-Oriented Module Architecture) 정의

1. 기능이 최우선 (Feature First): 모든 코드는 비즈니스 기능(예: User, Quiz, Ranking)을 기준으로 src/modules 아래에 그룹화됩니다.
2. 모듈은 수직적이고 완전해야 한다 (Vertical & Self-Contained Modules): 각 모듈은 자체적으로 routes, controllers, services, interfaces 등을 포함하여 기능 제공에 필요한 모든 요소를 갖춰야 합니다.
   - 📁 routes — API 경로 정의 및 요청 스키마 검증 (프레젠테이션 계층)
   - 📁 controllers — HTTP 요청/응답 처리 및 비즈니스 로직 호출 (애플리케이션 계층)
   - 📁 services — 핵심 비즈니스 로직 및 백그라운드 작업 처리 (비즈니스/도메인 계층)
   - 📁 interfaces — 데이터 구조 및 타입 정의 (데이터 전송 객체, DTO)

3. 명확한 경계와 소통 (Clear Boundaries & Communication):
   - 모듈은 다른 모듈의 controllers나 services를 직접 임포트(import)해서는 안 됩니다.
   - 모듈 간의 소통이 필요할 경우, 공유 events, 중앙 서비스 버스(Service Bus), 또는 잘 정의된 API를 통해서만 이루어져야 합니다. 이는 모듈 간의 결합도를 최소화합니다.
4. 공유 커널 (Shared Kernel): 여러 모듈에서 공통으로 사용되는 로직(e.g., utils), 설정(config), 핵심 엔티티(entities), 플러그인(plugins) 등은 모듈 외부의 공유 영역에 둡니다. 이는 코드 중복을 방지합니다.
5. 단일 진입점 (Single Entry Point): 외부에서 모듈의 기능에 접근하는 주된 방법은 해당 모듈의 routes를 통하는 것이어야 합니다.
