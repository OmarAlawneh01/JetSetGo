import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Grid, Button, Box, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[4],
    },
}));

const StyledCardMedia = styled(CardMedia)({
    height: 200,
    position: 'relative',
});

const DetailsContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const Recommendations = ({ recommendations = [] }) => {
    const navigate = useNavigate();
    const [expandedCard, setExpandedCard] = useState(null);

    const handleCardClick = (index) => {
        setExpandedCard(expandedCard === index ? null : index);
    };

    const handleViewHotelsFlights = (city, country) => {
        navigate(`/search?destination=${encodeURIComponent(`${city}, ${country}`)}`);
    };

    const renderCardDetails = (rec) => {
        if (!rec.details) return null;

        return (
            <DetailsContainer>
                {rec.details.rating && (
                    <Box display="flex" alignItems="center" mb={1}>
                        <Rating value={rec.details.rating} readOnly precision={0.5} />
                        <Typography variant="body2" ml={1}>
                            ({rec.details.rating})
                        </Typography>
                    </Box>
                )}
                {rec.details.priceLevel && (
                    <Typography variant="body2" gutterBottom>
                        Price Level: {'$'.repeat(rec.details.priceLevel)}
                    </Typography>
                )}
            </DetailsContainer>
        );
    };

    const renderCard = (rec, index) => {
        if (!rec) return null;

        const photoUrl = rec.photoUrl || '/placeholder-city.jpg';
        const city = rec.city || 'Unknown City';
        const country = rec.country || 'Unknown Country';

        return (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <StyledCard onClick={() => handleCardClick(index)}>
                    <StyledCardMedia
                        image={photoUrl}
                        title={`${city}, ${country}`}
                    />
                    <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {city}, {country}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            {rec.reason || 'No reason provided'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Estimated Cost: {rec.cost || 'Not available'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Best Time to Visit: {rec.bestTime || 'Not available'}
                        </Typography>

                        {expandedCard === index && renderCardDetails(rec)}

                        <Box mt={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewHotelsFlights(city, country);
                                }}
                            >
                                View Hotels & Flights
                            </Button>
                        </Box>
                    </CardContent>
                </StyledCard>
            </Grid>
        );
    };

    if (!recommendations || recommendations.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                    No recommendations available
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {recommendations.map((rec, index) => renderCard(rec, index))}
        </Grid>
    );
};

export default Recommendations; 