# nodBeat: AI Motion-to-Music Agent

## 🎵 Project Vision

**nodBeat**는 사용자의 모션과 배경 공간의 정보를 실시간으로 분석하여 생성형 음악(Generative Music)을 만드는 AI Agent 프로젝트입니다. 사용자의 움직임을 하나의 악기로 변환하고, 주변 환경의 분위기를 음악적 요소로 승화시키는 것을 목표로 합니다.

## 🚀 Key Features

- **Motion Analysis**: 카메라를 통한 사용자의 실시간 동작 인식 및 데이터화
- **Spatial Intelligence**: 배경 이미지/비디오 분석을 통한 환경 정보 추출
- **Real-time Generative Music**: 수집된 데이터를 바탕으로 실시간 음악 생성 및 변조
- **AI Agent Integration**: 사용자-환경-음악 간의 상호작용을 조율하는 지능형 엔진

## 🛠 Tech Stack

- **Frontend**: React (v19), TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (추천)
- **Audio Engine**: Tone.js 또는 Web Audio API (예정)
- **AI/ML**: MediaPipe (Motion), TensorFlow.js 또는 OpenAI/Anthropic API (Context Analysis)

## 📁 Project Structure

- `src/components`: UI 및 상호작용 컴포넌트
- `src/hooks`: 모션 인식 및 오디오 로직 관련 커스텀 훅
- `src/services`: AI 에이전트 및 외부 API 연동 로직
- `src/assets`: 오디오 샘플 및 정적 자산

## 📝 Development Guidelines

- **Performance First**: 실시간 오디오 및 비디오 처리를 위해 성능 최적화를 최우선으로 합니다.
- **Type Safety**: TypeScript를 엄격하게 사용하여 런타임 에러를 최소화합니다.
- **Modular Design**: 모션 인식부와 음악 생성부를 독립적으로 설계하여 확장성을 확보합니다.
