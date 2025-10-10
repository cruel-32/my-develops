# FSD - entites layer

프로젝트에서 다루는 핵심 데이터 개념을 나타냅니다.
비즈니스 용어(예: User, Post, Product)와 일치하는 경우가 많습니다.

Entity Slice에는 다음을 포함할 수 있습니다:

구성

- 📁 model — 데이터 상태와 검증 스키마
- 📁 api — 해당 Entity의 API 요청
- 📁 ui — Entity의 시각적 표현
  - 완전한 UI 블록이 아니어도 됨
  - 여러 페이지에서 재사용 가능하게 설계
  - 비즈니스 로직은 props/slot으로 연결 권장

Entity 간 관계

원칙적으로 Slice끼리는 서로 모르면 좋습니다.
하지만 현실적으로 다른 Entity를 포함하거나 상호작용하는 경우가 있습니다.
이때는 로직을 상위 Layer(Feature/Page) 로 올려 처리하세요.

만약 한 Entity 데이터에 다른 Entity가 포함된다면,
@x 표기를 사용해 교차 Public API로 연결을 명시적으로 드러내세요.

### entities/artist/model/artist.ts

```typescript
import type { Song } from 'entities/song/@x/artist';

export interface Artist {
  name: string;
  songs: Array<Song>;
}
```
