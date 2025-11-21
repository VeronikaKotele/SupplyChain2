import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import './PowerBIDashboard.css';

interface PowerBIDashboardProps {
  embedUrl: string;
  accessToken: string;
  embedId: string;
  embedType?: 'report' | 'dashboard';
}

function PowerBIDashboard({ 
  embedUrl, 
  accessToken, 
  embedId,
  embedType = 'report' 
}: PowerBIDashboardProps) {
  return (
    <div className="powerbi-container">
      <PowerBIEmbed
        embedConfig={{
          type: embedType,
          id: embedId,
          embedUrl: embedUrl,
          accessToken: accessToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: true
              }
            },
            background: models.BackgroundType.Transparent,
          }
        }}
        eventHandlers={
          new Map([
            ['loaded', function () { console.log('Report loaded'); }],
            ['rendered', function () { console.log('Report rendered'); }],
            ['error', function (event) { console.log('Error:', event?.detail); }]
          ])
        }
        cssClassName="powerbi-embed"
        getEmbeddedComponent={(embeddedReport) => {
          console.log('Power BI embedded component loaded', embeddedReport);
        }}
      />
    </div>
  );
}

export default PowerBIDashboard;
