# nodBeat: AI Motion-to-Music Agent

## 🎵 Project Vision

**nodBeat**는 사용자의 모션과 배경 공간의 정보를 실시간으로 분석하여 생성형 음악(Generative Music)을 만드는 AI Agent 프로젝트입니다. 사용자의 움직임을 하나의 악기로 변환하고, 주변 환경의 분위기를 음악적 요소로 승화시키는 것을 목표로 합니다.

## 🚀 Key Features & Core Logic

- **BPM from Head Nodding**: 사용자의 고개 끄덕임(Head Nodding)을 실시간으로 감지하여 음악의 주요 BPM 데이터로 활용합니다.
- **Spatial Genre/Instrument Selection**: 사용자의 배경 공간을 분석하여 그 분위기에 가장 어울리는 장르와 악기를 선정합니다. (OpenAI API 활용)
- **Age-Adaptive Beat Prompting**: 사용자의 얼굴을 기반으로 나이대를 추정하고, 해당 연령대와 설정된 BPM에 최적화된 비트 생성 프롬프트를 구성합니다. (OpenAI API 활용)
- **AI Music Generation (Suno Integration)**: 최종적으로 확정된 장르, 비트, 악기 정보를 종합하여 Suno API로 전송, 생성된 음악을 스트리밍하거나 다운로드합니다.

## 🛠 Tech Stack

- **Frontend**: React (v19), TypeScript
- **Build Tool**: Vite
- **AI/ML (Perception)**: MediaPipe (Face & Pose Landmark Detection)
- **AI/ML (Reasoning)**: OpenAI API (Vision for spatial analysis, GPT-4o for prompt engineering)
- **Music Generation**: Suno API (via unofficial/community wrapper or direct integration)
- **Audio Engine**: Web Audio API (for playback and sync)

## 📁 Project Structure

- `src/components`: UI 및 비디오/오디오 제어 컴포넌트
- `src/hooks`: MediaPipe 연동(고개 끄덕임 감지), OpenAI 연동, Suno API 제어 훅
- `src/services`: OpenAI Vision 분석, Suno 음악 생성 요청 로직
- `src/utils`: BPM 계산, 프롬프트 템플릿 관리

## 📝 Development Guidelines

- **Latency Optimization**: 고개 끄덕임 감지에서 음악 생성 요청까지의 지연 시간을 최소화합니다.
- **Contextual Accuracy**: 공간과 나이대 분석 결과가 음악적 결과물과 일관성을 갖도록 프롬프트 정교화에 집중합니다.
- **User Feedback**: 현재 분석 중인 상태(나이대 추정, 장르 선정 등)를 시각적으로 피드백하여 사용자 경험을 높입니다.
