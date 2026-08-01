import { Info } from 'lucide-react';
import { IconButton, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'm3you';

export default function TooltipBasic() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <IconButton variant="tonal" aria-label="More information">
              <Info size={20} aria-hidden="true" />
            </IconButton>
          }
        />
        <TooltipContent>Plain tooltips name an element</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
