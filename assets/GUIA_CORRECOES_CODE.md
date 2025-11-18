# 🔧 GUIA DE CORREÇÕES - CODE SNIPPETS

## Como Implementar as Soluções Propostas

---

## 1. SUPABASE INTEGRAÇÃO REAL

### Arquivo: `lib/supabase.ts` (CRIAR NOVO)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Arquivo: `.env.local` (ADICIONAR)

```
VITE_SUPABASE_URL=https://tdbsvkuvkplchiduilbu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYnN2a3V2a3BsY2hpZHVpbGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODMzMzEsImV4cCI6MjA3OTA1OTMzMX0.kHHYr5UCRub7v8RNtr_qDkqaGrNd9Jx5tcwg-aWpXfw
```

### Arquivo: `hooks/useProjects.ts` (CRIAR NOVO)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { Project } from '@shared/schema'

const PROJECTS_QUERY_KEY = ['projects']

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        logger.error('Failed to fetch projects', error)
        throw error
      }
      
      return data as Project[]
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: { title: string; description?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([input])
        .select()
        .single()
      
      if (error) {
        logger.error('Failed to create project', error)
        throw error
      }
      
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
    onError: (error) => {
      logger.error('Create project mutation failed', error as Error)
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (project: Project) => {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', project.id)
        .select()
        .single()
      
      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}
```

### Arquivo: `hooks/useModuleProgress.ts` (CRIAR NOVO)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ModuleProgress } from '@shared/schema'

export function useModuleProgress(projectId: string) {
  return useQuery({
    queryKey: ['moduleProgress', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('project_id', projectId)
        .order('module_number', { ascending: true })
        .order('phase_number', { ascending: true })
      
      if (error) throw error
      return data as ModuleProgress[]
    },
  })
}

export function useUpdateModuleProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (progress: ModuleProgress) => {
      const { data, error } = await supabase
        .from('module_progress')
        .upsert(progress)
        .select()
        .single()
      
      if (error) throw error
      return data as ModuleProgress
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['moduleProgress', variables.project_id],
      })
    },
  })
}
```

---

## 2. REACT QUERY INTEGRAÇÃO

### Arquivo: `App.tsx` (ATUALIZAR)

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/contexts/theme-context'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import Home from '@/pages/home'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Home />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
```

### Arquivo: `lib/queryClient.ts` (MELHORAR)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

---

## 3. VALIDAÇÃO COM ZOD

### Arquivo: `lib/validation.ts` (CRIAR NOVO)

```typescript
import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título pode ter no máximo 100 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'Descrição pode ter no máximo 500 caracteres')
    .optional()
    .default(''),
})

export const updateModuleProgressSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  module_number: z.number().int().min(1).max(4),
  module_title: z.string(),
  phase_number: z.number().int().min(1),
  phase_title: z.string(),
  content: z.string().optional(),
  prompt_created: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateModuleProgressInput = z.infer<typeof updateModuleProgressSchema>
```

### Arquivo: `components/create-project-dialog.tsx` (ATUALIZAR)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectInput) => Promise<void>
  isLoading?: boolean
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateProjectDialogProps) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const handleSubmit = async (data: CreateProjectInput) => {
    try {
      await onSubmit(data)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Failed to create project:', error)
      // Error handling via toast/callback
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Projeto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Quiz Platform para Cartórios"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição do projeto..."
                      {...field}
                      disabled={isLoading}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 4. ERROR BOUNDARY

### Arquivo: `components/error-boundary.tsx` (CRIAR NOVO)

```typescript
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Algo deu errado</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || 'Erro desconhecido'}
              </AlertDescription>
            </Alert>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Recarregar
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 5. LOGGER UTILS

### Arquivo: `lib/logger.ts` (CRIAR NOVO)

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  error?: Error
}

const isDevelopment = import.meta.env.DEV

class Logger {
  private logs: LogEntry[] = []

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    }

    this.logs.push(entry)

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift()
    }

    if (isDevelopment) {
      const style = this.getConsoleStyle(level)
      console.log(`%c[${level.toUpperCase()}]`, style, message, data || '')
    }

    // Send to monitoring service (e.g., Sentry, LogRocket)
    if (level === 'error' && !isDevelopment) {
      this.sendToMonitoring(entry)
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error) {
    this.log('error', message, undefined, error)
  }

  debug(message: string, data?: any) {
    if (isDevelopment) {
      this.log('debug', message, data)
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      info: 'color: #3b82f6; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      debug: 'color: #8b5cf6; font-weight: bold;',
    }
    return styles[level]
  }

  private sendToMonitoring(entry: LogEntry) {
    // Implementation would depend on your monitoring service
    // Example: Sentry.captureException(entry.error)
  }

  getLogs() {
    return this.logs
  }
}

export const logger = new Logger()
```

---

## 6. AUTO-SAVE COM DEBOUNCE

### Arquivo: `hooks/useAutoSave.ts` (CRIAR NOVO)

```typescript
import { useEffect, useRef, useCallback, useState } from 'react'

interface UseAutoSaveOptions {
  delay?: number
  onSave: (content: string) => Promise<void>
}

export function useAutoSave(content: string, options: UseAutoSaveOptions) {
  const { delay = 2000, onSave } = options
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSave = useCallback(async () => {
    try {
      setSaveState('saving')
      await onSave(content)
      setSaveState('saved')
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (error) {
      setSaveState('error')
      console.error('Auto-save failed:', error)
      
      // Retry after 5 seconds
      setTimeout(() => setSaveState('idle'), 5000)
    }
  }, [content, onSave])

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout only if content has changed
    timeoutRef.current = setTimeout(() => {
      handleSave()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, delay, handleSave])

  return { saveState }
}
```

### Uso em PhaseDetailDialog:

```typescript
import { useAutoSave } from '@/hooks/useAutoSave'

export function PhaseDetailDialog({ ... }) {
  const [content, setContent] = useState('')
  const { saveState } = useAutoSave(content, {
    delay: 3000,
    onSave: async (newContent) => {
      await onSave(phase.moduleNumber, phase.phaseNumber, newContent)
    },
  })

  return (
    <>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="..."
      />
      
      <div className="text-xs text-muted-foreground">
        {saveState === 'saving' && '💾 Salvando...'}
        {saveState === 'saved' && '✅ Salvo!'}
        {saveState === 'error' && '❌ Erro ao salvar'}
        {saveState === 'idle' && ''}
      </div>
    </>
  )
}
```

---

## 7. ENUM PARA STATUS

### Arquivo: `shared/schema.ts` (ATUALIZAR)

```typescript
export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export type PhaseStatusValue = PhaseStatus | string

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  [PhaseStatus.NOT_STARTED]: 'Não Iniciado',
  [PhaseStatus.IN_PROGRESS]: 'Em Progresso',
  [PhaseStatus.COMPLETED]: 'Concluído',
}

export const PHASE_STATUS_COLORS: Record<PhaseStatus, string> = {
  [PhaseStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [PhaseStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [PhaseStatus.COMPLETED]: 'bg-green-100 text-green-800',
}
```

---

## 8. BREADCRUMB COMPONENT

### Arquivo: `components/breadcrumb-nav.tsx` (CRIAR NOVO)

```typescript
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href && !item.isActive ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={item.isActive ? 'text-foreground font-medium' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
```

---

## 9. TESTS EXAMPLE

### Arquivo: `components/__tests__/CreateProjectDialog.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateProjectDialog } from '../create-project-dialog'
import { describe, it, expect, vi } from 'vitest'

describe('CreateProjectDialog', () => {
  it('renders dialog when open', () => {
    render(
      <CreateProjectDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText('Criar Novo Projeto')).toBeInTheDocument()
  })

  it('validates required title field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <CreateProjectDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    const submitButton = screen.getByText(/Criar Projeto/)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Título é obrigatório')).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <CreateProjectDialog
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )

    const titleInput = screen.getByPlaceholderText(/Ex: Quiz Platform/)
    await user.type(titleInput, 'Test Project')

    const submitButton = screen.getByText(/Criar Projeto/)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
        })
      )
      expect(onClose).toHaveBeenCalled()
    })
  })
})
```

---

Este guia fornece **implementações prontas para usar**. Comece pelas correções P0 (Supabase + React Query), depois implemente P1 (Validação + Error Handling).

Boa sorte! 🚀
