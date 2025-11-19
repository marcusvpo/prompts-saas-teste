import { useState, useEffect, useRef } from "react";
import { Copy, Check, FileText, Target, Pin, Save, AlertCircle } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";

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
  const lastSavedContentRef = useRef(initialContent);

  // Debounce content changes by 2 seconds
  const debouncedContent = useDebounce(content, 2000);
  const [isSaving, setIsSaving] = useState(false);

  const onSaveRef = useRef(onSave);
  
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    setContent(initialContent);
    lastSavedContentRef.current = initialContent;
  }, [initialContent, phase?.id]);

  // Auto-save effect
  useEffect(() => {
    if (!phase || !isOpen) return;

    const saveContent = async () => {
      if (debouncedContent !== lastSavedContentRef.current) {
        setIsSaving(true);
        try {
          await onSaveRef.current(phase.moduleNumber, phase.phaseNumber, debouncedContent);
          lastSavedContentRef.current = debouncedContent;
          toast({
            title: "Salvo automaticamente",
            description: "Seu progresso foi salvo.",
            duration: 2000,
          });
        } catch (error) {
          toast({
            title: "Erro ao salvar automaticamente",
            description: "Não foi possível salvar suas alterações. Tente novamente.",
            variant: "destructive",
            duration: 3000,
          });
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveContent();
  }, [debouncedContent, phase?.moduleNumber, phase?.phaseNumber, isOpen, toast]);

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
    setIsSaving(true);
    try {
      await onSave(phase.moduleNumber, phase.phaseNumber, content);
      lastSavedContentRef.current = content;
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
    } finally {
      setIsSaving(false);
    }
  };

  const charCount = content.length;
  const maxChars = 5000; // Reasonable limit for text content

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
                  {(isSaving || isSavingExternal) && (
                    <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      Salvando...
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Cole aqui o PRD/artefato gerado ou suas anotações desta fase. O conteúdo será salvo automaticamente.
                </p>
                <div className="relative">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Cole aqui o conteúdo gerado pela IA ou suas anotações..."
                    className={cn(
                      "min-h-[200px] font-mono text-sm pr-4 pb-8",
                      charCount > maxChars && "border-destructive focus-visible:ring-destructive"
                    )}
                    data-testid="textarea-phase-content"
                  />
                  <div className={cn(
                    "absolute bottom-2 right-2 text-xs text-muted-foreground",
                    charCount > maxChars && "text-destructive font-medium"
                  )}>
                    {charCount} / {maxChars} caracteres
                  </div>
                </div>
                {charCount > maxChars && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    O texto excede o limite recomendado.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-phase">
                  {isSaving ? "Salvando..." : "Salvar e Fechar"}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
