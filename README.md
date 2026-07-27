# Creverse Game Hub

Creverse에서 제작한 웹 게임과 인터랙티브 콘텐츠를 한곳에서 소개하는 정적 허브입니다.
별도의 빌드 과정 없이 GitHub Pages에서 배포되며, 현재 6개의 콘텐츠를 제공합니다.

**Live:** [https://cereels-dev.github.io/game-hub/](https://cereels-dev.github.io/game-hub/)

## 콘텐츠

| # | 이름 | 제공 방식 |
|---|---|---|
| 01 | [STORY GOGGLES](https://cereels-dev.github.io/two/) | 외부 GitHub Pages |
| 02 | [MATTER OF PERSPECTIVE](https://cereels-dev.github.io/literary/) | 외부 GitHub Pages |
| 03 | [Life is a Fairy Tale](https://cereels-dev.github.io/game-hub/demo/) | 이 저장소의 빌드 결과물 |
| 04 | [Connections](https://cereels-dev.github.io/game-hub/connections/) | 이 저장소의 단일 HTML 앱 |
| 05 | [Coupang](https://cereels-gamedev.github.io/coupang/) | 외부 GitHub Pages |
| 06 | [Escape Room](https://cereels-gamedev.github.io/escape-room/) | 외부 GitHub Pages |

## 저장소 구조

```text
.
├── index.html          # 허브 메인 페이지
├── assets/             # 허브 카드 썸네일
├── connections/        # Connections 정적 앱
├── demo/               # Life is a Fairy Tale 배포용 빌드 결과물
├── tests/              # Node.js 기반 회귀 테스트
└── docs/               # 변경 설계 및 작업 기록
```

`index.html`에 스타일과 마크업이 함께 들어 있는 정적 페이지입니다. 패키지 매니저나
번들러 설정은 없으며, 루트 디렉터리 자체가 배포 대상입니다.

## 로컬 실행

저장소를 클론한 뒤 정적 파일 서버를 실행합니다.

```bash
git clone https://github.com/CeREELs-DEV/game-hub.git
cd game-hub
python3 -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 열어 확인합니다.
상대 경로로 연결된 `demo/`를 함께 검증하려면 `index.html` 파일을 직접 여는 대신
정적 파일 서버를 사용하는 것이 좋습니다.

## 테스트

Node.js 18 이상에서 별도 의존성 설치 없이 테스트할 수 있습니다.

```bash
node --test tests/index.test.mjs
```

테스트는 카드 순서와 링크, 업데이트 날짜, 이미지 파일, `demo/`의 빌드 산출물 및
주요 동작이 배포 상태와 일치하는지 확인합니다.

## 콘텐츠 업데이트

### 허브 카드

카드를 추가하거나 수정할 때는 다음 항목을 함께 갱신합니다.

1. `index.html`의 카드 링크, 제목, 순서 및 `UPDATED` 날짜
2. `assets/`의 썸네일
3. 헤더의 `PLAYABLE` 개수
4. `tests/index.test.mjs`의 기대값
5. 이 README의 콘텐츠 표

날짜는 `<time datetime="YYYY-MM-DD">UPDATED · YYYY.MM.DD</time>` 형식을 유지합니다.

### Life is a Fairy Tale

`demo/`는 React 소스가 아니라 배포용 `dist` 결과물입니다. 원본 앱에서 빌드한 뒤
생성된 파일을 `demo/`에 복사해야 합니다. `demo/index.html`은 `#root`를 마운트하고
`./assets/`의 해시 파일을 불러오는 로더 형태를 유지해야 합니다. 자세한 내용은
[`demo/README.md`](demo/README.md)를 참고하세요.

## 배포

`main` 브랜치의 정적 파일을 GitHub Pages에서 제공합니다. 변경 전 로컬 서버에서
화면을 확인하고 전체 테스트를 통과시킨 뒤 배포 브랜치에 반영하세요.
