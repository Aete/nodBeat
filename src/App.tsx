import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Header,
  HeaderName,
  Grid,
  Column,
  Content,
  Tile,
  Theme,
  Stack,
  Tag,
  Button,
  ToastNotification,
} from '@carbon/react';
import { 
  Music, 
  ChatBot, 
  Area,
  Microphone
} from '@carbon/icons-react';
import Camera from './components/Camera';
import {
  spatialPlaceLabelKo,
  type SpatialAnalysis,
} from './services/spatialVision';
import {
  generateMusicWithElevenLabs,
  type MusicGenerationInput,
} from './services/elevenlabsMusic';

function App() {
  const [spatial, setSpatial] = useState<SpatialAnalysis | null>(null);
  const [musicStatus, setMusicStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicFileName, setMusicFileName] = useState<string | null>(null);
  const [toast, setToast] = useState<
    | null
    | {
        kind: 'success' | 'error';
        title: string;
        subtitle: string;
      }
  >(null);

  const lastMusicCtxRef = useRef<MusicGenerationInput | null>(null);

  const handleThumbsUp = async (ctx: MusicGenerationInput) => {
    if (musicStatus === 'loading') return;
    lastMusicCtxRef.current = ctx;

    setMusicStatus('loading');
    setToast(null);

    if (musicUrl) {
      URL.revokeObjectURL(musicUrl);
      setMusicUrl(null);
      setMusicFileName(null);
    }

    try {
      const { url, fileName } = await generateMusicWithElevenLabs(ctx);
      setMusicUrl(url);
      setMusicFileName(fileName);
      setMusicStatus('ready');
      setToast({
        kind: 'success',
        title: '음악 생성 완료',
        subtitle: '바로 재생하거나 다운로드할 수 있어요.',
      });
    } catch (e) {
      setMusicStatus('error');
      setToast({
        kind: 'error',
        title: '음악 생성 실패',
        subtitle: String(e),
      });
    }
  };

  const downloadMusic = () => {
    if (!musicUrl) return;
    const a = document.createElement('a');
    a.href = musicUrl;
    a.download = musicFileName ?? 'nodBeat.mp3';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    return () => {
      if (musicUrl) URL.revokeObjectURL(musicUrl);
    };
  }, [musicUrl]);

  const musicStatusText = useMemo(() => {
    if (musicStatus === 'loading') return '음악 생성 중…';
    if (musicStatus === 'ready') return '음악 생성 완료';
    if (musicStatus === 'error') return '음악 생성 실패';
    return '엄지척(👍)으로 음악 생성';
  }, [musicStatus]);

  return (
    <Theme theme="g100">
      <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--cds-background)' }}>
        <Header aria-label="nodBeat">
          <HeaderName href="/" prefix="Project">
            nodBeat
          </HeaderName>
        </Header>

        {toast && (
          <div
            style={{
              position: 'fixed',
              top: 'calc(var(--cds-spacing-09) + 3rem)',
              right: 'var(--cds-spacing-05)',
              zIndex: 1000,
              maxWidth: 'min(420px, calc(100vw - 2rem))',
            }}
          >
            <ToastNotification
              kind={toast.kind}
              title={toast.title}
              subtitle={toast.subtitle}
              timeout={5000}
              onCloseButtonClick={() => setToast(null)}
            />
          </div>
        )}

        <Content style={{ paddingTop: 'var(--cds-spacing-08)' }}>
          <Grid narrow>
            <Column
              lg={16}
              md={8}
              sm={4}
              style={{ marginBottom: 'var(--cds-spacing-07)', textAlign: 'left' }}
            >
              <Stack gap={3}>
                <h1 style={{
                  fontSize: 'var(--cds-productive-heading-05)',
                  fontWeight: 'var(--cds-font-weight-semibold)',
                  color: 'var(--cds-text-primary)'
                }}>
                  Motion to Music
                </h1>
                <p style={{
                  fontSize: 'var(--cds-body-long-02)',
                  color: 'var(--cds-text-secondary)',
                  maxWidth: '52ch'
                }}>
                  고개 끄덕임은 BPM, 표정은 감정으로 분석됩니다.
                  손으로 브이(V) 표시하면 배경 공간을 인지하고, 엄지척(👍)을 하면 음악을 생성합니다.
                </p>
              </Stack>
            </Column>

            <Column lg={12} md={8} sm={4} style={{ marginBottom: 'var(--cds-spacing-08)' }}>
              <Camera
                onSpatialUpdate={setSpatial}
                onThumbsUp={handleThumbsUp}
                thumbsUpEnabled={musicStatus !== 'ready'}
              />
            </Column>

            <Column lg={4} md={8} sm={4}>
              <Stack gap={6}>
                <Tile>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-05)', marginBottom: 'var(--cds-spacing-04)' }}>
                    <Music size={24} style={{ color: 'var(--cds-link-primary)' }} />
                    <span style={{ fontWeight: 'var(--cds-font-weight-semibold)' }}>BPM Analysis</span>
                  </div>
                  <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                    고개를 끄덕여 비트를 조절하세요.
                  </p>
                </Tile>

                <Tile>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-05)', marginBottom: 'var(--cds-spacing-04)' }}>
                    <Area size={24} style={{ color: 'var(--cds-support-info)' }} />
                    <span style={{ fontWeight: 'var(--cds-font-weight-semibold)' }}>Spatial Vibe</span>
                  </div>
                  {spatial ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cds-spacing-03)' }}>
                      <Tag type="purple" size="sm" renderIcon={Area}>
                        {spatialPlaceLabelKo(spatial.place)} {Math.round(spatial.confidence * 100)}%
                      </Tag>
                      <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                        {spatial.reason}
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                      브이(V) 표시하면 공간을 캡쳐해 분석합니다.
                    </p>
                  )}
                </Tile>

                <Tile>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-05)', marginBottom: 'var(--cds-spacing-04)' }}>
                    <ChatBot size={24} style={{ color: 'var(--cds-support-success)' }} />
                    <span style={{ fontWeight: 'var(--cds-font-weight-semibold)' }}>AI Composer</span>
                  </div>
                  <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                    나이와 분위기에 맞는 비트를 생성합니다.
                  </p>
                </Tile>

                <Tile>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-05)', marginBottom: 'var(--cds-spacing-04)' }}>
                    <Microphone size={24} style={{ color: 'var(--cds-support-warning)' }} />
                    <span style={{ fontWeight: 'var(--cds-font-weight-semibold)' }}>Status</span>
                  </div>
                  <Stack gap={3}>
                    <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                      {musicStatusText}
                    </p>

                    {musicStatus === 'ready' && musicUrl && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cds-spacing-03)' }}>
                        <audio
                          controls
                          src={musicUrl}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)' }}>
                          <Button size="sm" kind="primary" onClick={downloadMusic}>
                            다운로드
                          </Button>
                          <Button
                            size="sm"
                            kind="secondary"
                            onClick={() => {
                              const last = lastMusicCtxRef.current;
                              if (last) void handleThumbsUp(last);
                            }}
                          >
                            다시 생성
                          </Button>
                        </div>
                      </div>
                    )}

                  </Stack>
                </Tile>
              </Stack>
            </Column>
          </Grid>
        </Content>

        <footer style={{ 
          padding: 'var(--cds-spacing-07)', 
          textAlign: 'center', 
          fontSize: 'var(--cds-label-01)', 
          color: 'var(--cds-text-disabled)',
          borderTop: '1px solid var(--cds-border-subtle)'
        }}>
          © 2026 nodBeat - AI Generative Music Project Powered by IBM Carbon
        </footer>
      </div>
    </Theme>
  );
}

export default App;
