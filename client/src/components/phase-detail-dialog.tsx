import { useState, useEffect, useRef } from "react";
import { Copy, Check, FileText, Target, Pin, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedPhase } from "@/lib/framework-data";
import { cn } from "@/lib/utils";

interface PhaseDetailDialogProps {
  phase: ProcessedPhase | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleNumber: number, phaseNumber: number, content: string) => Promise<void>;
  initialContent?: string;
  isSavingExternal?: boolean;
}

export function PhaseDetailDialog({
  phase,
  isOpen,
  onClose,
  onSave,
  initialContent = "",
  isSavingExternal = false,
}: PhaseDetailDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const { toast } = useToast();
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef(initialContent);

  useEffect(() => {
    setContent(initialContent);
    lastSavedContentRef.current = initialContent;
  }, [initialContent, phase?.id]);

  useEffect(() => {
    if (!phase || !isOpen) return;

    if (content !== lastSavedContentRef.current) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await onSave(phase.moduleNumber, phase.phaseNumber, content);
          lastSavedContentRef.current = content;
        } catch (error) {
          toast({
            title: "Erro ao salvar automaticamente",
            description: "Não foi possível salvar suas alterações. Tente novamente.",
            variant: "destructive",
          });
        }
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [content, phase, isOpen, onSave, toast]);

  if (!phase) return null;

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(phase.prompt_template);
      setCopiedTemplate(true);
      toast({
        title: "Template copiado!",
        description: "O template de prompt foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedTemplate(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await onSave(phase.moduleNumber, phase.phaseNumber, content);
      toast({
        title: "Progresso salvo!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o progresso. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-semibold mb-2">
                    {phase.moduleTitle}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Fase {phase.phaseNumber}: {phase.nome}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  Módulo {phase.moduleNumber}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-accent/10 border-l-4 border-l-primary p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">
                      Descrição
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {phase.descricao}
                    </p>
                  </div>
                </div>
              </div>

              {phase.metodologia && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">
                        Metodologia
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {phase.metodologia}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {phase.etapas && phase.etapas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Pin className="h-4 w-4 text-primary" />
                    Etapas
                  </h4>
                  <div className="space-y-3">
                    {phase.etapas.map((etapa) => (
                      <div
                        key={etapa.etapa}
                        className="p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                            {etapa.etapa}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{etapa.nome}</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {etapa.instrucao}
                            </p>
                            {etapa.constraint && (
                              <p className="text-xs italic text-muted-foreground border-l-2 border-l-orange-500 pl-2">
                                Restrição: {etapa.constraint}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                    Template de Prompt
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTemplate}
                    className="gap-2"
                    data-testid="button-copy-template"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Template
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground">
                    {phase.prompt_template}
                  </pre>
                </div>
              </div>

              {(phase.foco_areas || phase.componentes_saida) && (
                <Accordion type="single" collapsible className="w-full">
                  {phase.foco_areas && (
                    <AccordionItem value="foco">
                      <AccordionTrigger className="text-sm font-semibold">
                        Áreas de Foco
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 mt-2">
                          {phase.foco_areas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-muted-foreground">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {phase.componentes_saida && (
                    <AccordionItem value="componentes">
                      <AccordionTrigger className="text-sm font-semibold">
                        Componentes de Saída
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 mt-2">
                          {phase.componentes_saida.map((comp: any, index: number) => (
                            <div key={index} className="p-3 bg-card border border-border rounded-md">
                              <p className="font-medium text-sm mb-1">{comp.nome}</p>
                              <p className="text-xs text-muted-foreground">{comp.descricao}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                    <Save className="h-4 w-4 text-primary" />
                    Salvar Progresso
                  </h4>
                  {isSavingExternal && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Salvando automaticamente...
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Cole aqui o PRD/artefato gerado ou suas anotações desta fase. O conteúdo será salvo automaticamente.
                </p>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole aqui o conteúdo gerado pela IA ou suas anotações..."
                  className="min-h-[200px] font-mono text-sm"
                  data-testid="textarea-phase-content"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button onClick={handleSave} data-testid="button-save-phase">
                  Salvar Progresso
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
