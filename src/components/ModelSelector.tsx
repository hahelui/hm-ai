import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { aiService, type Model } from "@/services/ai-service"
import { toast } from "sonner"

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  onModelDetails?: (model: Model) => void
}

export function ModelSelector({ value, onValueChange, onModelDetails }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [models, setModels] = React.useState<Model[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setIsLoading(true)
    
    // Default models to use as fallback
    const defaultModels = [
      { id: "gpt-4", object: "model", owned_by: "openai", name: "GPT-4" },
      { id: "gpt-4-turbo", object: "model", owned_by: "openai", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", object: "model", owned_by: "openai", name: "GPT-3.5 Turbo" },
      { id: "gpt-4o", object: "model", owned_by: "openai", name: "GPT-4o" },
      { id: "gpt-4o-mini", object: "model", owned_by: "openai", name: "GPT-4o Mini" },
    ]
    
    try {
      const isConfigured = await aiService.isConfigured()
      if (!isConfigured) {
        // Use default models if API not configured
        setModels(defaultModels)
        return
      }

      const fetchedModels = await aiService.listModels()
      setModels(fetchedModels)
    } catch (error) {
      // Silently fallback to default models (don't log error if it's just auth)
      setModels(defaultModels)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModelSelect = async (modelId: string) => {
    onValueChange(modelId)
    setOpen(false)

    // Fetch model details if callback provided
    if (onModelDetails) {
      try {
        const modelDetails = await aiService.getModel(modelId)
        onModelDetails(modelDetails)
      } catch (error) {
        console.error('Failed to fetch model details:', error)
      }
    }
  }

  const getModelLabel = (model: Model) => {
    return model.name || model.id
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : value ? (
            getModelLabel(models.find((model) => model.id === value) || { id: value, object: "model", owned_by: "" })
          ) : (
            "Select model..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleModelSelect(model.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === model.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getModelLabel(model)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
