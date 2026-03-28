# nodBeat

nodBeat는 사용자의 모션과 배경 공간을 실시간으로 분석해 “제스처 기반”으로 음악을 만들어주는 프로젝트입니다.

## What it does

- 고개 끄덕임: BPM 추정
- 표정: 감정(valence) 추정
- 손 브이(V): 현재 프레임을 캡쳐해 OpenAI Vision으로 배경 공간(오피스/산/강 등) 분류
- 엄지척(👍): BPM/감정/공간 정보를 정리해 영문 음악 프롬프트를 만든 뒤 ElevenLabs Music API로 음악 생성

## Tech

- Frontend: React + TypeScript + Vite
- UI: IBM Carbon (`@carbon/react`)
- Perception: MediaPipe
- Spatial recognition: OpenAI Vision (`/api/openai/vision`)
- Music generation: ElevenLabs Music (`/api/elevenlabs/music`)

## Environment variables

로컬 개발에서는 `VITE_` 프리픽스 키로도 동작하도록 폴백을 넣어두었지만, 배포 환경에서는 반드시 서버 전용 키를 사용하세요.

- OpenAI
  - `OPENAI_API_KEY` (권장, 서버)
  - `VITE_OPENAI_API_KEY` (로컬 폴백)
- ElevenLabs
  - `ELEVENLABS_API_KEY` (권장, 서버)
  - `VITE_ELEVENLABS_API_KEY` 또는 `VITE_ELEVEN_LABS_API` (로컬 폴백)

## Run locally

```bash
npm install
npm run dev
```

브라우저에서 카메라 권한을 허용한 뒤,

- 브이(V): 배경 공간 분석
- 엄지척(👍): 음악 생성

을 실행할 수 있습니다.

## Deploy

Vercel을 사용하는 경우, Project 환경변수에 아래 값을 설정해야 `/api/*` 기능이 정상 동작합니다.

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`

