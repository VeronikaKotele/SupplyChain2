import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import './PowerBIDashboard.css';

interface PowerBIDashboardProps {
  embedUrl: string;
}

function PowerBIDashboard({ embedUrl }: PowerBIDashboardProps) {
  return (
    <div className="powerbi-container">
      <PowerBIEmbed
        embedConfig={{
          type: 'report',
          embedUrl: embedUrl,
          tokenType: models.TokenType.Aad,
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
            ['error', function (event) { console.log('Error:', event?.detail); }],
            ['dataSelected', function (event) { console.log('Data selected:', event?.detail); }],
            ['filtersApplied', function (event) { 
              console.log('Filters changed!', event?.detail);
              // You can react here, e.g. reload data, highlight UI, send analytics, etc.
            }]
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
