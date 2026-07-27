# Creverse Game Hub

Creverse에서 제작한 웹 게임과 인터랙티브 콘텐츠를 하나의 저장소에서 관리하고
GitHub Pages로 배포하는 게임 허브입니다.

**Live:** [https://cereels-dev.github.io/game-hub/](https://cereels-dev.github.io/game-hub/)

## 게임

| # | 이름 | 설명 | 내부 경로 |
|---|---|---|---|
| 01 | STORY GOGGLES | 이야기를 읽고 스토리 맵, 투표, 장면 배열 활동을 통해 서사 구조를 탐색하는 인터랙티브 리딩 게임 | [`games/story-goggles/`](games/story-goggles/) |
| 02 | MATTER OF PERSPECTIVE | 같은 문학 장면을 여러 인물의 시점으로 비교하며 관점에 따라 해석이 달라지는 과정을 체험하는 게임 | [`games/perspective/`](games/perspective/) |
| 03 | Life is a Fairy Tale | 일기나 사진으로 남긴 일상의 순간을 장면별 동화 이야기로 만들어 보는 스토리 제작 도구 | [`games/fairy-tale/`](games/fairy-tale/) |
| 04 | Connections | 16개의 단어에서 공통점을 찾아 네 개씩 네 그룹으로 묶는 어휘 분류 퍼즐 | [`games/connections/`](games/connections/) |
| 05 | Coupang | 컨베이어 벨트로 들어오는 단어를 알맞은 상자에 빠르게 분류하는 어휘 게임 | [`games/coupang/`](games/coupang/) |
| 06 | Escape Room | 단어와 단서를 활용해 여러 장치를 풀고 제한된 시간 안에 방을 탈출하는 어휘 퍼즐 | [`games/escape-room/`](games/escape-room/) |

허브의 모든 카드는 이 저장소 내부의 상대 경로를 사용합니다. 배포된 게임은
`https://cereels-dev.github.io/game-hub/games/<game>/`에서 제공됩니다.

## 저장소 구조

```text
.
├── .github/workflows/     # 테스트 및 GitHub Pages 통합 배포
├── assets/                # 허브 카드 썸네일
├── games/
│   ├── connections/       # 단일 HTML 앱
│   ├── coupang/           # 단일 HTML 앱
│   ├── escape-room/       # 단일 HTML 앱
│   ├── fairy-tale/        # React 앱의 배포용 빌드 결과물
│   ├── perspective/       # Vite 소스 프로젝트
│   └── story-goggles/     # 단일 HTML 앱
├── tests/                 # 허브 및 모노레포 회귀 테스트
└── index.html             # 허브 메인 페이지
```

`story-goggles`, `perspective`, `coupang`, `escape-room`은 기존 독립 저장소의 Git
이력을 `git subtree`로 보존하여 통합했습니다.

## 로컬 실행

저장소 루트에서 정적 파일 서버를 실행합니다.

```bash
git clone https://github.com/CeREELs-DEV/game-hub.git
cd game-hub
python3 -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다.

Perspective를 수정할 때는 별도의 Vite 개발 서버를 사용할 수 있습니다.

```bash
npm ci --prefix games/perspective
npm run dev --prefix games/perspective
```

## 테스트와 빌드

허브 내부 링크와 게임 진입점을 검사합니다.

```bash
node --test tests/monorepo.test.mjs
```

Perspective의 테스트와 프로덕션 빌드는 다음과 같이 실행합니다.

```bash
npm test --prefix games/perspective
npm run build --prefix games/perspective
```

기존 Life is a Fairy Tale 배포 산출물에 대한 상세 회귀 테스트는 아래 명령으로
실행할 수 있습니다.

```bash
node --test tests/index.test.mjs
```

## 게임 업데이트

### 정적 게임

`connections`, `coupang`, `escape-room`, `story-goggles`는 각 디렉터리의
`index.html`과 상대 경로 에셋을 직접 수정합니다. 절대 경로(`/assets/...`) 대신
게임 디렉터리를 기준으로 한 상대 경로(`./assets/...`)를 사용해야 합니다.

### Matter of Perspective

소스는 `games/perspective/`에 있으며 Vite의 `base`를 `./`로 유지해야 합니다.
GitHub Actions가 의존성을 설치하고 `dist/`를 생성한 뒤 배포 산출물의
`games/perspective/`에 복사합니다.

### Life is a Fairy Tale

`games/fairy-tale/`은 React 소스가 아니라 배포용 `dist` 결과물입니다. 원본 앱에서
빌드한 파일을 이 디렉터리에 복사합니다. `index.html`은 `#root`를 마운트하고
`./assets/`의 해시 파일을 불러오는 형태를 유지해야 합니다. 자세한 내용은
[`games/fairy-tale/README.md`](games/fairy-tale/README.md)를 참고하세요.

### 허브 카드

카드를 추가하거나 수정할 때는 다음 항목을 함께 갱신합니다.

1. `index.html`의 카드 링크, 제목, 순서 및 `UPDATED` 날짜
2. `assets/`의 썸네일
3. 헤더의 `PLAYABLE` 개수
4. `tests/monorepo.test.mjs`와 필요한 회귀 테스트
5. 이 README의 게임 표

날짜는 `<time datetime="YYYY-MM-DD">UPDATED · YYYY.MM.DD</time>` 형식을 유지합니다.

## 배포

`main` 브랜치에 변경이 푸시되면
[`deploy.yml`](.github/workflows/deploy.yml)이 다음 작업을 수행합니다.

1. Perspective 의존성 설치 및 테스트
2. 허브 모노레포 통합 테스트
3. Perspective 프로덕션 빌드
4. 허브와 여섯 게임을 하나의 Pages artifact로 조립
5. GitHub Pages 배포
