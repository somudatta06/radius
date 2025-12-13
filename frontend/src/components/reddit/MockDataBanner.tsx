import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function MockDataBanner() {
  return (
    <Alert className="border-yellow-500 bg-yellow-50 mb-6">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-900 font-semibold">
        Demo Mode: Mock Reddit Data
      </AlertTitle>
      <AlertDescription className="text-yellow-800">
        The Reddit threads shown below are demonstration examples, not real Reddit data.
        In production, this feature requires Reddit API integration to show verified threads.
        <strong className="block mt-2">
          Thread URLs, subreddits, and citation counts are NOT REAL.
        </strong>
      </AlertDescription>
    </Alert>
  );
}
