import React from "react";

interface Client {
  clientId: string;
  isRecording: boolean;
}

interface ClientAvatarsProps {
  clients: Client[];
  currentClientId: string | null;
}

const ClientAvatars = ({ clients, currentClientId }: ClientAvatarsProps) => {
  const getBorder = (client: Client) => {
    if (client.clientId === currentClientId) {
      return "border-[rgba(124,157,248,1)] shadow-lg shadow-[rgba(59,130,246,0.38)] bg-white/30 blur-backdrop-blur-3xl";
    }
    if (client.isRecording) {
      return "border-[rgba(145,106,251,1)] shadow-lg shadow-[rgba(190,197,254,0.6)] bg-white/30 backdrop-blur-3xl";
    }
    return "border-gray-300/40 shadow-md shadow-gray-300/30 bg-white/20 backdrop-blur-3xl";
  };

  const getIndicator = (client: Client) => {
    if (client.isRecording) {
      return "bg-[rgba(145,106,251,1)] shadow-[0_0_8px_rgba(190,197,254,0.6)] border-[rgba(200,181,253,0.9)]";
    }
    return null;
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 font-body">{clients.length} connected</span>

      <div className="flex -space-x-0">
        {clients.map((client) => {
          const border = getBorder(client);
          const indicator = getIndicator(client);
          const isYou = client.clientId === currentClientId;

          const tooltip = `Client ${client.clientId}${isYou ? " (You)" : ""}${client.isRecording ? " (Recording)" : ""}`;

          return (
            <div
              key={client.clientId}
              title={tooltip}
              className={`relative w-10 h-10 backdrop-blur-3xl rounded-full border-2 bg-white shadow-sm
                flex items-center justify-center text-xs font-medium text-gray-600
                transition-all duration-200 hover:scale-110 ${border} ${isYou ? "z-5" : "z-0"} hover:z-10`}
            >
              {/* Person icon */}
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                         1.79-4 4 1.79 4 4 4zm0 2c-2.67 
                         0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>

              {/* Status dot */}
              {indicator && (
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white/70 ${indicator}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-3 text-xs text-gray-500 font-body">
        <Legend color="border-[rgba(124,157,248,1)]" label="You" />
        <Legend color="border-[rgba(145,106,251,1)]" label="Recording" />
      </div>
    </div>
  );
};

interface LegendProps {
  color: string;
  label: string;
  filled?: boolean;
}

const Legend = ({ color, label, filled = false }: LegendProps) => (
  <div className="flex items-center space-x-1">
    <div
      className={`w-3 h-3 rounded-full ${filled ? color : `border-2 ${color}`
        }`}
    />
    <span>{label}</span>
  </div>
);

export default ClientAvatars;
