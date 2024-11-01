import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, List, ListItemText, Typography, TextField, ListItemButton, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import debounce from 'lodash.debounce';

interface Content {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
}

const App: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState<{ id: string; title: string } | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://notetaker-evaff4gsghfeg0a2.germanywestcentral-01.azurewebsites.net/api';

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await axios.get<Content[]>(`${API_BASE_URL}/contents`);
      setContents(res.data);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setSnackbar({ open: true, message: 'Failed to fetch contents.', severity: 'error' });
    }
  };

  const handleSelect = (content: Content) => {
    setSelectedContent(content);
  };

  const handleNewContent = async () => {
    if (newTitle.trim() === '') return;
    try {
      const payload = selectedContent && selectedContent.parentId === null
        ? { title: newTitle, parentId: selectedContent.id }
        : { title: newTitle };
      
      const res = await axios.post<Content>(`${API_BASE_URL}/contents`, payload);
      setContents([...contents, res.data]);
      setNewTitle('');
      setSnackbar({ open: true, message: 'Content created successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error creating content:', error);
      setSnackbar({ open: true, message: 'Failed to create content.', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/contents/${id}`);
      setContents(contents.filter(content => content.id !== id && content.parentId !== id));
      if (selectedContent?.id === id) setSelectedContent(null);
      setSnackbar({ open: true, message: 'Content deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting content:', error);
      setSnackbar({ open: true, message: 'Failed to delete content.', severity: 'error' });
    }
  };

  // Debounced content update function
  const debouncedUpdateContent = useCallback(
    debounce(async (id: string, updatedContent: string) => {
      try {
        const res = await axios.put<Content>(`${API_BASE_URL}/contents/${id}`, { content: updatedContent });
        setSelectedContent(res.data);
        setContents(contents.map(content => (content.id === res.data.id ? res.data : content)));
        setSnackbar({ open: true, message: 'Content updated successfully!', severity: 'success' });
      } catch (error) {
        console.error('Error updating content:', error);
        setSnackbar({ open: true, message: 'Failed to update content.', severity: 'error' });
      }
    }, 2000),
    [contents, API_BASE_URL]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!selectedContent) return;
    const updatedContent = e.target.value;
    setSelectedContent({ ...selectedContent, content: updatedContent });
    debouncedUpdateContent(selectedContent.id, updatedContent);
  };

  // Handle title editing
  const handleTitleEdit = (id: string, title: string) => {
    setEditingTitle({ id, title });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingTitle) return;
    setEditingTitle({ ...editingTitle, title: e.target.value });
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editingTitle) {
      debouncedUpdateTitle(editingTitle.id, editingTitle.title);
      setEditingTitle(null);
    }
  };

  const debouncedUpdateTitle = useCallback(
    debounce(async (id: string, updatedTitle: string) => {
      try {
        const res = await axios.put<Content>(`${API_BASE_URL}/contents/${id}`, { title: updatedTitle });
        setContents(contents.map(content => (content.id === res.data.id ? res.data : content)));
        setSnackbar({ open: true, message: 'Title updated successfully!', severity: 'success' });
      } catch (error) {
        console.error('Error updating title:', error);
        setSnackbar({ open: true, message: 'Failed to update title.', severity: 'error' });
      }
    }, 500),
    [contents, API_BASE_URL]
  );

  const handleTitleBlur = () => {
    if (editingTitle) {
      debouncedUpdateTitle(editingTitle.id, editingTitle.title);
      setEditingTitle(null);
    }
  };

  // Helper to build hierarchy
  const buildHierarchy = () => {
    const parents = contents.filter(content => !content.parentId);
    const children = contents.filter(content => content.parentId);
    return parents.map(parent => ({
      ...parent,
      children: children.filter(child => child.parentId === parent.id),
    }));
  };

  const hierarchicalContents = buildHierarchy();

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Box width="300px" borderRight="1px solid #ccc" padding="16px" overflow="auto">
        <Typography variant="h6">Contents</Typography>
        <List>
          {hierarchicalContents.map(parent => (
            <Box 
              key={parent.id}
            >
              <ListItemButton
                onClick={() => handleSelect(parent)}
                onMouseEnter={() => setHoveredItemId(parent.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                sx={{ position: 'relative' }}
              >
                {editingTitle?.id === parent.id ? (
                  <TextField
                    value={editingTitle.title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyPress={handleTitleKeyPress}
                    autoFocus
                  />
                ) : (
                  <ListItemText primary={parent.title} onDoubleClick={() => handleTitleEdit(parent.id, parent.title)} />
                )}
                {hoveredItemId === parent.id && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDelete(parent.id); }}
                    sx={{ position: 'absolute', right: 0 }}
                    className="delete-button"
                  >
                    Delete
                  </Button>
                )}
              </ListItemButton>
              {/* Render children */}
              <List component="div" disablePadding>
                {parent.children.map(child => (
                  <Box 
                    key={child.id}
                  >
                    <ListItemButton
                      sx={{ pl: 4, position: 'relative' }}
                      onClick={() => handleSelect(child)}
                      onMouseEnter={() => setHoveredItemId(child.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    >
                      {editingTitle?.id === child.id ? (
                        <TextField
                          value={editingTitle.title}
                          onChange={handleTitleChange}
                          onBlur={handleTitleBlur}
                          onKeyPress={handleTitleKeyPress}
                          autoFocus
                        />
                      ) : (
                        <ListItemText primary={child.title} sx={{ color: 'gray' }} onDoubleClick={() => handleTitleEdit(child.id, child.title)} />
                      )}
                      {hoveredItemId === child.id && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDelete(child.id); }}
                          sx={{ position: 'absolute', right: 0 }}
                          className="delete-button"
                        >
                          Delete
                        </Button>
                      )}
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            </Box>
          ))}
        </List>
        {/* Yeni İçerik Ekleme */}
        <Box mt={2}>
          <TextField
            label={selectedContent && selectedContent.parentId === null ? `Yeni Alt İçerik Ekle "${selectedContent.title}"` : "Yeni İçerik Başlığı"}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleNewContent();
              }
            }}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewContent}
            fullWidth
            sx={{ mt: 1 }}
          >
            {selectedContent && selectedContent.parentId === null ? "Alt İçerik Ekle" : "İçerik Ekle"}
          </Button>
        </Box>
      </Box>

      {/* İçerik Paneli */}
      <Box flexGrow={1} padding="16px" overflow="auto">
        {selectedContent ? (
          <>
            <Typography variant="h5">{selectedContent.title}</Typography>
            <TextField
              multiline
              minRows={20}
              variant="outlined"
              fullWidth
              value={selectedContent.content}
              onChange={handleContentChange}
              placeholder="İçeriğinizi buraya yazın..."
              sx={{ mt: 2 }}
            />
          </>
        ) : (
          <Typography variant="h6" color="textSecondary">
            İçerik başlığını seçerek içeriği görüntüleyebilir veya düzenleyebilirsiniz.
          </Typography>
        )}
      </Box>

      {/* Snackbar Bildirimleri */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
