import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Movie } from '../App';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeNavigationProp;
}

const COLORS = {
  background: '#0D1B2A',
  primary: '#48CAE4',
  secondary: '#0077B6',
  text: '#E0E1DD',
  cardBg: '#112233',
  inputBorder: '#0077B640',
  placeholder: '#6C7A89',
  divider: '#1E3248',
  badgeBg: '#0077B6',
  ratingGood: '#48CAE4',
  ratingAvg: '#F4A261',
  ratingBad: '#E76F51',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const MOVIE_API_URL =
  'https://api.themoviedb.org/3/movie/popular?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US&page=1';

const FALLBACK_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'Inception',
    poster_path: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-16',
    vote_average: 8.4,
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology...',
    genre_ids: [28, 878, 12],
  },
  {
    id: 2,
    title: 'The Dark Knight',
    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    overview: 'When the menace known as the Joker wreaks havoc and chaos...',
    genre_ids: [28, 80, 18],
  },
  {
    id: 3,
    title: 'Interstellar',
    poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    release_date: '2014-11-07',
    vote_average: 8.6,
    overview: 'A team of explorers travel through a wormhole in space...',
    genre_ids: [12, 18, 878],
  },
  {
    id: 4,
    title: 'The Matrix',
    poster_path: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    release_date: '1999-03-31',
    vote_average: 8.2,
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality...',
    genre_ids: [28, 878],
  },
];

function getRatingColor(rating: number): string {
  if (rating >= 8) return COLORS.ratingGood;
  if (rating >= 6.5) return COLORS.ratingAvg;
  return COLORS.ratingBad;
}

function getYear(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return dateStr.split('-')[0];
}

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
}

function MovieCard({ movie, onPress }: MovieCardProps): React.JSX.Element {
  const ratingColor = getRatingColor(movie.vote_average);
  const year = getYear(movie.release_date);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.posterWrapper}>
        <Image source={{ uri: movie.poster_path }} style={styles.poster} resizeMode="cover" />
        <View pointerEvents="none" style={[styles.ratingBadge, { borderColor: ratingColor }]}>
          <Text style={[styles.ratingText, { color: ratingColor }]}>
            ★ {movie.vote_average.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.cardYear}>{year}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Home({ navigation }: Props): React.JSX.Element {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filtered, setFiltered] = useState<Movie[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerLogoutButton} 
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerLogoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchMovies = async (): Promise<void> => {
      try {
        const res = await fetch(MOVIE_API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const results: Movie[] = (json.results ?? []).map((m: any) => ({
          ...m,
          poster_path: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
        }));
        if (results.length === 0) throw new Error('Empty results');
        setMovies(results);
        setFiltered(results);
      } catch {
        setError('Using local dataset — network unavailable.');
        setMovies(FALLBACK_MOVIES);
        setFiltered(FALLBACK_MOVIES);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(movies);
    } else {
      setFiltered(movies.filter(m => m.title.toLowerCase().includes(q)));
    }
  }, [search, movies]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Movie>) => (
      <MovieCard
        movie={item}
        onPress={() => navigation.navigate('Detail', { movie: item })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Movie) => item.id.toString(), []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching movies…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, searchFocused && styles.searchWrapperFocused]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies…"
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={(text) => setSearch(text)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'Movie' : 'Movies'} Available
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎭</Text>
          <Text style={styles.emptyTitle}>No movies found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList<Movie>
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.placeholder,
    marginTop: 14,
    fontSize: 14,
  },
  headerLogoutButton: {
    backgroundColor: 'rgba(72, 202, 228, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  headerLogoutText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: 50,
  },
  searchWrapperFocused: {
    borderColor: COLORS.primary,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 10,
    height: '100%',
  },
  clearIcon: {
    color: COLORS.placeholder,
    fontSize: 14,
    padding: 4,
  },
  errorBanner: {
    color: COLORS.ratingAvg,
    fontSize: 11,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  resultsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  resultsCount: {
    color: COLORS.placeholder,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
    elevation: 5,
  },
  posterWrapper: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0D1B2ACC',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardYear: {
    color: COLORS.placeholder,
    fontSize: 11,
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.placeholder,
    fontSize: 14,
  },
});

const divider = COLORS.divider;
export { divider };