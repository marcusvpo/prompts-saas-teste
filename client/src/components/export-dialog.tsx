import { Download, FileJson, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Project, ModuleProgress, MasterArtifact } from "@shared/schema";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  moduleProgress: ModuleProgress[];
  masterArtifacts: MasterArtifact[];
}

export function ExportDialog({
  isOpen,
  onClose,
  project,
  moduleProgress,
  masterArtifacts,
}: ExportDialogProps) {
  const { toast } = useToast();

  const exportAsJSON = () => {
    if (!project) return;

    const data = {
      project,
      moduleProgress,
      masterArtifacts,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Projeto exportado!",
      description: "O arquivo JSON foi baixado com sucesso.",
    });
    onClose();
  };

  const exportAsMarkdown = () => {
    if (!project) return;

    let markdown = `# ${project.title}\n\n`;
    if (project.description) {
      markdown += `${project.description}\n\n`;
    }
    markdown += `---\n\n`;
    markdown += `**Criado em:** ${new Date(project.createdAt).toLocaleDateString("pt-BR")}\n`;
    markdown += `**Última atualização:** ${new Date(project.updatedAt).toLocaleDateString("pt-BR")}\n\n`;

    const modules = [1, 2, 3, 4];
    modules.forEach((moduleNum) => {
      const modulePhases = moduleProgress.filter((p) => p.moduleNumber === moduleNum);
      if (modulePhases.length > 0) {
        markdown += `## Módulo ${moduleNum}: ${modulePhases[0]?.moduleTitle || ""}\n\n`;
        modulePhases.forEach((phase) => {
          markdown += `### Fase ${phase.phaseNumber}: ${phase.phaseTitle}\n\n`;
          if (phase.content) {
            markdown += `${phase.content}\n\n`;
          }
          if (phase.promptCreated) {
            markdown += `**Prompt criado:**\n\`\`\`\n${phase.promptCreated}\n\`\`\`\n\n`;
          }
          markdown += `---\n\n`;
        });
      }
    });

    if (masterArtifacts.length > 0) {
      markdown += `## Artefatos Mestres\n\n`;
      masterArtifacts.forEach((artifact) => {
        markdown += `### ${artifact.artifactType}\n\n`;
        markdown += `${artifact.artifactContent}\n\n`;
        markdown += `---\n\n`;
      });
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Projeto exportado!",
      description: "O arquivo Markdown foi baixado com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Projeto</DialogTitle>
          <DialogDescription>
            Escolha o formato de exportação do seu projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={exportAsJSON}
            className="w-full justify-start gap-3"
            variant="outline"
            size="lg"
            data-testid="button-export-json"
          >
            <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="text-left flex-1">
              <div className="font-medium">Exportar como JSON</div>
              <div className="text-xs text-muted-foreground">
                Formato estruturado para backup e importação
              </div>
            </div>
            <Download className="h-4 w-4" />
          </Button>

          <Button
            onClick={exportAsMarkdown}
            className="w-full justify-start gap-3"
            variant="outline"
            size="lg"
            data-testid="button-export-markdown"
          >
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div className="text-left flex-1">
              <div className="font-medium">Exportar como Markdown</div>
              <div className="text-xs text-muted-foreground">
                Formato legível para documentação
              </div>
            </div>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
