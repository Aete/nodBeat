# nodBeat: AI Motion-to-Music Agent

## 🎵 Project Vision

**nodBeat**는 사용자의 모션과 배경 공간의 정보를 실시간으로 분석하여 생성형 음악(Generative Music)을 만드는 AI Agent 프로젝트입니다. 사용자의 움직임을 하나의 악기로 변환하고, 주변 환경의 분위기를 음악적 요소로 승화시키는 것을 목표로 합니다.

## 🚀 Key Features & Core Logic

- **BPM from Head Nodding**: 사용자의 고개 끄덕임(Head Nodding)을 실시간으로 감지하여 음악의 주요 BPM 데이터로 활용합니다.
- **Spatial Genre/Instrument Selection**: 사용자의 배경 공간을 분석하여 그 분위기에 가장 어울리는 장르와 악기를 선정합니다. (OpenAI API 활용)
- **Age-Adaptive Beat Prompting**: 사용자의 얼굴을 기반으로 나이대를 추정하고, 해당 연령대와 설정된 BPM에 최적화된 비트 생성 프롬프트를 구성합니다. (OpenAI API 활용)
- **AI Music Generation (Suno Integration)**: 최종적으로 확정된 장르, 비트, 악기 정보를 종합하여 Suno API로 전송, 생성된 음악을 스트리밍하거나 다운로드합니다.

## 🎨 Design System: IBM Carbon

모든 UI는 **IBM Carbon Design System**을 준수하여 전문적이고 일관된 사용자 경험을 제공합니다.

### 📝 Design Rules

- **Components**: 모든 UI 구성 요소(버튼, 모달, 그리드 등)는 `@carbon/react`에서 제공하는 공식 컴포넌트를 사용합니다. (예: `<Button>`, `<Grid>`, `<Column>`, `<Theme>`)
- **Styling**: 임의의 CSS 작성을 지양하고 Carbon의 **Design Token**을 우선적으로 사용합니다. (예: `var(--cds-spacing-05)`, `var(--cds-text-primary)`)
- **Typography**: 공식 폰트인 **IBM Plex Sans**를 사용합니다.
- **Layout**: Carbon의 16-column grid 시스템을 기반으로 레이아웃을 구성합니다.

## 🛠 Tech Stack

- **Frontend**: React (v19), TypeScript
- **Design System**: @carbon/react, Sass
- **Build Tool**: Vite
- **AI/ML (Perception)**: MediaPipe (Face & Pose Landmark Detection)
- **AI/ML (Reasoning)**: OpenAI API (Vision for spatial analysis, GPT-4o for prompt engineering)
- **Music Generation**: Suno API (via unofficial/community wrapper or direct integration)
- **Audio Engine**: Web Audio API (for playback and sync)

## 📁 Project Structure

- `src/components`: Carbon 컴포넌트를 활용한 UI 및 제어부
- `src/hooks`: MediaPipe 연동, OpenAI 연동, Suno API 제어 훅
- `src/services`: OpenAI Vision 분석, Suno 음악 생성 요청 로직
- `src/utils`: BPM 계산, 프롬프트 템플릿 관리
- `src/index.scss`: Carbon 글로벌 스타일 정의

## 📝 Development Guidelines

- **Carbon First**: 새로운 기능을 추가할 때 Carbon Design System에 적합한 컴포넌트가 있는지 먼저 확인합니다.
- **Latency Optimization**: 고개 끄덕임 감지에서 음악 생성 요청까지의 지연 시간을 최소화합니다.
- **Contextual Accuracy**: 공간과 나이대 분석 결과가 음악적 결과물과 일관성을 갖도록 프롬프트 정교화에 집중합니다.
