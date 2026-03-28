import {
  Header,
  HeaderName,
  Grid,
  Column,
  Content,
  Tile,
  Theme,
  Stack,
} from '@carbon/react';
import { 
  Music, 
  ChatBot, 
  Area,
  Microphone
} from '@carbon/icons-react';
import Camera from './components/Camera';

function App() {
  return (
    <Theme theme="g100">
      <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--cds-background)' }}>
        <Header aria-label="nodBeat">
          <HeaderName href="/" prefix="Project">
            nodBeat
          </HeaderName>
        </Header>

        <Content style={{ paddingTop: 'var(--cds-spacing-10)' }}>
          <Grid>
            {/* Header Text Section */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: 'var(--cds-spacing-08)' }}>
              <Stack gap={4}>
                <h1 style={{ 
                  fontSize: 'var(--cds-productive-heading-06)', 
                  fontWeight: 'var(--cds-font-weight-bold)',
                  color: 'var(--cds-text-primary)'
                }}>
                  Motion to Music
                </h1>
                <p style={{ 
                  fontSize: 'var(--cds-body-short-02)', 
                  color: 'var(--cds-text-secondary)',
                  maxWidth: '600px'
                }}>
                  당신의 고개 끄덕임과 주변 환경이 만나 실시간 음악이 탄생합니다.
                  AI가 분석하는 당신만의 비트를 경험해보세요.
                </p>
              </Stack>
            </Column>

            {/* Camera Section */}
            <Column lg={12} md={8} sm={4} style={{ marginBottom: 'var(--cds-spacing-08)' }}>
              <Camera />
            </Column>

            {/* Analysis Dashboard Section */}
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
                  <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                    공간에 어울리는 장르와 악기를 선정합니다.
                  </p>
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
                  <p style={{ fontSize: 'var(--cds-label-01)', color: 'var(--cds-text-secondary)' }}>
                    음악 생성 대기 중...
                  </p>
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
