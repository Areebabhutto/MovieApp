import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

// ─── Types ──────────────────────────────────────────────────────────────────
type DetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

interface Props {
  navigation: DetailNavigationProp;
  route: DetailRouteProp;
}

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLORS = {
  background: '#0D1B2A',
  primary: '#48CAE4',
  secondary: '#0077B6',
  text: '#E0E1DD',
  cardBg: '#112233',
  placeholder: '#6C7A89',
  divider: '#1E3248',
  ratingGood: '#48CAE4',
  ratingAvg: '#F4A261',
  ratingBad: '#E76F51',
  overlayShadow: '#0D1B2AEE',
};

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.48;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getRatingColor(rating: number): string {
  if (rating >= 8) return COLORS.ratingGood;
  if (rating >= 6.5) return COLORS.ratingAvg;
  return COLORS.ratingBad;
}

function getRatingLabel(rating: number): string {
  if (rating >= 8) return 'Excellent';
  if (rating >= 7) return 'Very Good';
  if (rating >= 6) return 'Good';
  if (rating >= 5) return 'Average';
  return 'Poor';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Genre map (TMDB genre IDs → names) ─────────────────────────────────────
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// ─── Detail Screen ────────────────────────────────────────────────────────────
export default function Detail({ navigation, route }: Props): React.JSX.Element {
  const { movie } = route.params;
  const ratingColor = getRatingColor(movie.vote_average);
  const ratingLabel = getRatingLabel(movie.vote_average);
  const formattedDate = formatDate(movie.release_date);
  const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

  // Resolve genre names from IDs if available
  const genres =
    movie.genre_ids && movie.genre_ids.length > 0
      ? movie.genre_ids.map(id => GENRE_MAP[id] ?? 'Unknown').slice(0, 3)
      : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Hero Poster ── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: movie.poster_path }}
            style={styles.heroPoster}
            resizeMode="cover"
          />
          {/* Gradient overlay from bottom */}
          <View style={styles.heroOverlay} />

          {/* Back button overlay on top of image */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Title + year floating on hero */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {movie.title}
            </Text>
            <Text style={styles.heroYear}>{year}</Text>
          </View>
        </View>

        {/* ── Info Section ── */}
        <View style={styles.infoSection}>

          {/* ── Rating + Genres Row ── */}
          <View style={styles.metaRow}>
            {/* Rating Badge */}
            <View style={[styles.ratingBadge, { borderColor: ratingColor, shadowColor: ratingColor }]}>
              <Text style={[styles.ratingScore, { color: ratingColor }]}>
                ★ {movie.vote_average.toFixed(1)}
              </Text>
              <View style={[styles.ratingDivider, { backgroundColor: ratingColor }]} />
              <Text style={[styles.ratingLabel, { color: ratingColor }]}>
                {ratingLabel}
              </Text>
            </View>

            {/* Genre pills */}
            <View style={styles.genrePills}>
              {genres.map(genre => (
                <View key={genre} style={styles.genrePill}>
                  <Text style={styles.genrePillText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={styles.sectionDivider} />

          {/* ── Release Date ── */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View>
              <Text style={styles.detailLabel}>Release Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          {/* ── Rating out of 10 ── */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏆</Text>
            <View>
              <Text style={styles.detailLabel}>Audience Score</Text>
              <Text style={styles.detailValue}>
                {movie.vote_average.toFixed(1)} / 10
              </Text>
            </View>
          </View>

          {/* ── Rating Bar ── */}
          <View style={styles.ratingBarWrapper}>
            <View style={styles.ratingBarTrack}>
              <View
                style={[
                  styles.ratingBarFill,
                  {
                    width: `${(movie.vote_average / 10) * 100}%`,
                    backgroundColor: ratingColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.ratingBarLabel}>
              {((movie.vote_average / 10) * 100).toFixed(0)}%
            </Text>
          </View>

          {/* ── Divider ── */}
          <View style={styles.sectionDivider} />

          {/* ── Plot Summary ── */}
          <View style={styles.overviewSection}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewAccent} />
              <Text style={styles.overviewTitle}>Plot Summary</Text>
            </View>
            <Text style={styles.overviewText}>
              {movie.overview
                ? movie.overview
                : 'No plot summary available for this title.'}
            </Text>
          </View>

          {/* ── Bottom padding ── */}
          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Hero
  heroContainer: {
    width: width,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroPoster: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.18,
    // Simulate a gradient using layered views is limited in RN without libraries;
    // we use a semi-opaque dark overlay for effect
    backgroundColor: COLORS.overlayShadow,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 16,
    backgroundColor: '#0D1B2ACC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroYear: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Info section
  infoSection: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Meta row (rating + genres)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingScore: {
    fontSize: 15,
    fontWeight: '800',
  },
  ratingDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  genrePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  genrePill: {
    backgroundColor: `${COLORS.secondary}22`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}55`,
  },
  genrePillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Divider
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 18,
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 14,
  },
  detailIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  detailLabel: {
    color: COLORS.placeholder,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },

  // Rating bar
  ratingBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingBarLabel: {
    color: COLORS.placeholder,
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },

  // Overview / Plot
  overviewSection: {
    marginBottom: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  overviewAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  overviewTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  overviewText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    opacity: 0.85,
  },

  bottomPad: {
    height: 40,
  },
});
