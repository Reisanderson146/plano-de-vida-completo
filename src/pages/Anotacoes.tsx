import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LIFE_AREAS, AREA_COLORS, LifeArea } from '@/lib/constants';
import { Loader2, Plus, Pencil, Trash2, Save, X, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  area: string | null;
  created_at: string;
}

export default function Anotacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', area: 'geral' });
  const [filter, setFilter] = useState<string>('todas');

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user!.id,
          title: newNote.title,
          content: newNote.content,
          area: newNote.area,
        });

      if (error) throw error;

      toast({ title: 'Anotação criada!' });
      setNewNote({ title: '', content: '', area: 'geral' });
      setIsDialogOpen(false);
      loadNotes();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: editingNote.title,
          content: editingNote.content,
          area: editingNote.area,
        })
        .eq('id', editingNote.id);

      if (error) throw error;

      toast({ title: 'Anotação atualizada!' });
      setEditingNote(null);
      loadNotes();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({ title: 'Anotação excluída!' });
      loadNotes();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredNotes = filter === 'todas' 
    ? notes 
    : notes.filter(n => n.area === filter);

  const getAreaLabel = (area: string | null) => {
    if (!area || area === 'geral') return 'Geral';
    return LIFE_AREAS.find(a => a.id === area)?.label || area;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Anotações</h1>
            <p className="text-muted-foreground">
              Registre o que precisa melhorar em cada área
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Anotação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Anotação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Título da anotação"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área</Label>
                  <Select value={newNote.area} onValueChange={(v) => setNewNote({ ...newNote, area: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      {LIFE_AREAS.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="O que você precisa melhorar?"
                    rows={5}
                  />
                </div>
                <Button onClick={handleCreateNote} className="w-full">
                  Criar Anotação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === 'todas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('todas')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'geral' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('geral')}
          >
            Geral
          </Button>
          {LIFE_AREAS.map((area) => (
            <Button
              key={area.id}
              variant={filter === area.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(area.id)}
              className={filter === area.id ? '' : AREA_COLORS[area.id]}
            >
              {area.label}
            </Button>
          ))}
        </div>

        {filteredNotes.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <StickyNote className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhuma anotação encontrada
              </h3>
              <p className="text-muted-foreground mb-6">
                Crie sua primeira anotação para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className={cn(
                  "shadow-lg transition-all hover:shadow-xl",
                  note.area && note.area !== 'geral' && AREA_COLORS[note.area as LifeArea]
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    {editingNote?.id === note.id ? (
                      <Input
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    )}
                    <div className="flex gap-1">
                      {editingNote?.id === note.id ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={handleUpdateNote}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingNote(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => setEditingNote(note)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getAreaLabel(note.area)} • {new Date(note.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </CardHeader>
                <CardContent>
                  {editingNote?.id === note.id ? (
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground/80 whitespace-pre-wrap">{note.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
