import { Button, RichTooltip, RichTooltipContent, RichTooltipTrigger, TooltipProvider } from 'm3you';

export default function TooltipRich() {
  return (
    <TooltipProvider>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="outlined">Rich tooltip</Button>} />
        <RichTooltipContent headline="Shape morphing" actions={<Button variant="text">Learn more</Button>}>
          Rich tooltips can carry a title, a paragraph of explanation and one action.
        </RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>
  );
}
