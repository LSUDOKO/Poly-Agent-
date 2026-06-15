import { VeniceChat } from "~~/components/AiAssistant/VeniceChat";

export default function AiAssistantPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col rounded-2xl border border-grey-100 overflow-hidden bg-white">
          <VeniceChat />
        </div>
      </div>
    </div>
  );
}
