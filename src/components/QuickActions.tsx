import { CreditCard, Smartphone, Shield, Key, HelpCircle, RefreshCw } from "lucide-react";

const quickActions = [
  { icon: Smartphone, label: "App not loading", message: "My banking app is not loading. It just shows a blank screen." },
  { icon: Key, label: "Can't log in", message: "I'm unable to log into my online banking account." },
  { icon: CreditCard, label: "Card issues", message: "I'm having issues with my debit/credit card." },
  { icon: Shield, label: "Security concern", message: "I noticed suspicious activity on my account." },
  { icon: RefreshCw, label: "Transfer failed", message: "My recent bank transfer failed but the amount was debited." },
  { icon: HelpCircle, label: "Other issue", message: "I need help with a different banking issue." },
];

interface QuickActionsProps {
  onSelect: (message: string) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display font-semibold text-foreground">
          How can we help you today?
        </h2>
        <p className="text-sm text-muted-foreground">
          Select a topic or describe your issue below
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelect(action.message)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-accent hover:shadow-sm active:scale-[0.98]"
          >
            <action.icon className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
