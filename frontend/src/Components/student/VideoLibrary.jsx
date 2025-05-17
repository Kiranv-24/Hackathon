import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { Search, MovieCreation, Visibility, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axios';

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  
  const categories = [
    'All',
    'Mathematics', 
    'Science', 
    'English', 
    'History', 
    'Geography', 
    'Technology',
    'Art',
    'Music',
    'Physical Education',
    'Other'
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/videos');
      if (response.data.success) {
        // Ensure all video URLs are properly formatted
        const formattedVideos = response.data.videos.map(video => ({
          ...video,
          videoUrl: video.videoUrl?.replace('http://', 'https://'),
          thumbnailUrl: video.thumbnailUrl?.replace('http://', 'https://')
        }));
        setVideos(formattedVideos);
      } else {
        setError(response.data.message || 'Failed to fetch videos');
        toast.error('Error loading videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Error loading videos. Please try again later.');
      toast.error('Error loading videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    if (!videoId) {
      toast.error('Invalid video ID');
      return;
    }
    navigate(`/user/video-player/${videoId}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredVideos = () => {
    return videos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          video.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                            video.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredVideos = getFilteredVideos();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Library
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredVideos.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            No videos found. Try adjusting your search.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6
                  }
                }}
              >
                <CardActionArea onClick={() => handleVideoClick(video.id)}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={video.thumbnailUrl || '/default-thumbnail.jpg'}
                    alt={video.title}
                    sx={{ 
                      objectFit: 'cover',
                      position: 'relative'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderTopLeftRadius: 4,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <AccessTime sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                    {formatDuration(video.duration)}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                      {video.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1.5
                      }}
                    >
                      {video.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={video.category || 'Uncategorized'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {video.views || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Divider />
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(video.createdAt)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MovieCreation sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {video.creator?.name || 'Mentor'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default VideoLibrary; 