import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

type Activity = {
	name?: string;
	details?: string;
	state?: string;
	sync_id?: string;
	session_id?: string;
	party?: { id?: string };
	timestamps?: { start?: number; end?: number };
	assets?: {
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
};

type Track = {
	id?: string;
	title: string;
	artist: string;
	album?: string;
	art?: string;
	duration?: number;
	start?: number;
	end?: number;
};

type LyricLine = {
	time: number;
	text: string;
};

type PluginStorage = {
	showLyrics?: boolean;
	showQueue?: boolean;
	overrideProfileTheme?: boolean;
};

const vstorage = storage as PluginStorage;
const SpotifyStore = findByStoreName("SpotifyStore");
const UserStore = findByStoreName("UserStore");
const { TableRow, TableSwitchRow, TableRowGroup } = findByProps(
	"TableRow",
	"TableSwitchRow",
	"TableRowGroup",
) ?? {};

const UserProfileAboutMeCard = findByName("UserProfileAboutMeCard", false);
const SimplifiedUserProfileAboutMeCard = findByName("SimplifiedUserProfileAboutMeCard", false);
const YouAboutMeCard = findByName("YouAboutMeCard", false);
const UserProfileBio = findByName("UserProfileBio", false);
const UserProfileCard = findByName("UserProfileCard", false);
const UserProfileSection = findByName("UserProfileSection", false);

const flexCenter = {
	alignItems: "center",
	justifyContent: "center",
} as const;

const styles = stylesheet.createThemedStyleSheet({
	card: {
		overflow: "hidden",
		borderRadius: 16,
		marginHorizontal: 12,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: semanticColors.BORDER_SUBTLE,
		backgroundColor: semanticColors.BACKGROUND_SECONDARY,
	},
	themeWash: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 138,
		opacity: 0.92,
	},
	diagonalA: {
		position: "absolute",
		width: "130%",
		height: 72,
		top: -8,
		left: -34,
		transform: [{ rotate: "-10deg" }],
	},
	diagonalB: {
		position: "absolute",
		width: "130%",
		height: 90,
		top: 48,
		right: -42,
		transform: [{ rotate: "12deg" }],
	},
	diagonalC: {
		position: "absolute",
		width: "120%",
		height: 62,
		bottom: -18,
		left: -28,
		transform: [{ rotate: "-6deg" }],
	},
	content: {
		padding: 12,
		gap: 12,
	},
	topRow: {
		flexDirection: "row",
		gap: 12,
		alignItems: "center",
	},
	artWrap: {
		width: 82,
		height: 82,
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: "rgba(255,255,255,0.12)",
	},
	art: {
		width: 82,
		height: 82,
	},
	artFallback: {
		width: 82,
		height: 82,
		...flexCenter,
	},
	info: {
		flex: 1,
		minWidth: 0,
	},
	eyebrow: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0,
		color: "rgba(255,255,255,0.78)",
		textTransform: "uppercase",
	},
	title: {
		fontSize: 20,
		fontWeight: "800",
		letterSpacing: 0,
		color: "#fff",
		marginTop: 4,
	},
	artist: {
		fontSize: 14,
		fontWeight: "600",
		color: "rgba(255,255,255,0.76)",
		marginTop: 2,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	seekTrack: {
		height: 5,
		borderRadius: 999,
		overflow: "hidden",
		backgroundColor: "rgba(255,255,255,0.22)",
	},
	seekFill: {
		height: 5,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.94)",
	},
	time: {
		fontSize: 11,
		fontWeight: "700",
		color: "rgba(255,255,255,0.68)",
		marginTop: 6,
	},
	queueCard: {
		borderRadius: 12,
		padding: 10,
		overflow: "hidden",
		backgroundColor: "rgba(0,0,0,0.22)",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.12)",
	},
	queueArt: {
		position: "absolute",
		right: -12,
		top: -16,
		width: 96,
		height: 96,
		borderRadius: 16,
		opacity: 0.28,
		transform: [{ rotate: "8deg" }],
	},
	queueTitle: {
		fontSize: 11,
		fontWeight: "800",
		color: "rgba(255,255,255,0.58)",
		textTransform: "uppercase",
	},
	queueSong: {
		fontSize: 14,
		fontWeight: "800",
		color: "#fff",
		marginTop: 3,
		maxWidth: "78%",
	},
	queueArtist: {
		fontSize: 12,
		fontWeight: "600",
		color: "rgba(255,255,255,0.68)",
		maxWidth: "78%",
	},
	lyrics: {
		gap: 4,
		paddingTop: 2,
	},
	lyricLine: {
		fontSize: 15,
		fontWeight: "800",
		color: "rgba(255,255,255,0.38)",
	},
	activeLyric: {
		fontSize: 19,
		color: "#fff",
	},
	empty: {
		marginHorizontal: 12,
		marginVertical: 8,
		borderRadius: 14,
		padding: 14,
		backgroundColor: semanticColors.BACKGROUND_SECONDARY,
		borderWidth: 1,
		borderColor: semanticColors.BORDER_SUBTLE,
	},
	emptyText: {
		color: semanticColors.TEXT_MUTED,
		fontSize: 13,
		fontWeight: "600",
	},
});

function normalizeAlbumArt(raw?: string) {
	if (!raw) return undefined;
	if (raw.startsWith("http")) return raw;
	if (raw.startsWith("spotify:")) return `https://i.scdn.co/image/${raw.slice("spotify:".length)}`;
	if (/^[a-zA-Z0-9]{32,}$/.test(raw)) return `https://i.scdn.co/image/${raw}`;
	return undefined;
}

function getCurrentTrack(): Track | null {
	const activity = SpotifyStore?.getActivity?.() as Activity | undefined;
	if (!activity?.details) return null;

	const start = activity.timestamps?.start;
	const end = activity.timestamps?.end;
	return {
		id: activity.sync_id,
		title: activity.details,
		artist: activity.state ?? "Spotify",
		album: activity.assets?.large_text,
		art: normalizeAlbumArt(activity.assets?.large_image),
		start,
		end,
		duration: start && end ? Math.max(0, end - start) : undefined,
	};
}

function trackFromUnknown(value: any): Track | null {
	if (!value) return null;
	const id = value.id ?? value.uri?.split(":").pop?.() ?? value.trackId;
	const title = value.name ?? value.title ?? value.details;
	const artist = value.artist
		?? value.artists?.map?.((x: any) => x.name ?? x).join(", ")
		?? value.state;
	if (!title) return null;
	const image = value.image
		?? value.album?.images?.[0]?.url
		?? value.albumArt
		?? value.assets?.large_image;
	return {
		id,
		title,
		artist: artist ?? "Spotify",
		album: value.album?.name ?? value.album ?? value.assets?.large_text,
		art: normalizeAlbumArt(image),
		duration: value.duration_ms ?? value.duration,
	};
}

function getNextTrack(): Track | null {
	const state = SpotifyStore?.getPlayerState?.()
		?? SpotifyStore?.getState?.()
		?? SpotifyStore?.getActiveSocketAndDevice?.()?.socket?.state;
	const candidates = [
		state?.nextTrack,
		state?.next_track,
		state?.queue?.[0],
		state?.nextTracks?.[0],
		state?.next_tracks?.[0],
		state?.playerState?.nextTrack,
		state?.player_state?.next_track,
	];
	for (const candidate of candidates) {
		const track = trackFromUnknown(candidate);
		if (track) return track;
	}
	return null;
}

function hashPalette(seed: string) {
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}
	const hue = Math.abs(hash) % 360;
	const hue2 = (hue + 42 + (hash % 80)) % 360;
	const hue3 = (hue + 188) % 360;
	return {
		base: `hsl(${hue}, 70%, 28%)`,
		mid: `hsl(${hue2}, 74%, 42%)`,
		soft: `hsl(${hue3}, 58%, 25%)`,
		dark: `hsl(${hue}, 58%, 12%)`,
	};
}

function msToClock(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const min = Math.floor(total / 60);
	const sec = `${total % 60}`.padStart(2, "0");
	return `${min}:${sec}`;
}

function parseSyncedLyrics(raw?: string): LyricLine[] {
	if (!raw) return [];
	return raw
		.split("\n")
		.map(line => {
			const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
			if (!match) return null;
			const [, m, s, ms = "0", text] = match;
			return {
				time: Number(m) * 60_000 + Number(s) * 1000 + Number(ms.padEnd(3, "0")),
				text: text.trim(),
			};
		})
		.filter((line): line is LyricLine => !!line && !!line.text);
}

function useSpotifySnapshot() {
	const [tick, setTick] = React.useState(0);
	React.useEffect(() => {
		const update = () => setTick((value: number) => value + 1);
		const interval = setInterval(update, 1000);
		const unsubscribers = [
			"SPOTIFY_PLAYER_STATE",
			"SELF_PRESENCE_STORE_UPDATE",
			"LOCAL_ACTIVITY_UPDATE",
		].map(type => {
			try {
				FluxDispatcher?.subscribe?.(type, update);
				return () => FluxDispatcher?.unsubscribe?.(type, update);
			} catch {
				return () => undefined;
			}
		});
		return () => {
			clearInterval(interval);
			unsubscribers.forEach(unsubscribe => unsubscribe());
		};
	}, []);

	return React.useMemo(() => ({
		track: getCurrentTrack(),
		next: getNextTrack(),
		tick,
	}), [tick]);
}

function useSyncedLyrics(track: Track | null) {
	const [lyrics, setLyrics] = React.useState([] as LyricLine[]);
	React.useEffect(() => {
		if (!vstorage.showLyrics || !track?.title || !track.artist) {
			setLyrics([]);
			return;
		}
		let cancelled = false;
		const params = new URLSearchParams({
			track_name: track.title,
			artist_name: track.artist.split(",")[0],
		});
		if (track.album) params.set("album_name", track.album);
		if (track.duration) params.set("duration", `${Math.round(track.duration / 1000)}`);

		fetch(`https://lrclib.net/api/get?${params.toString()}`)
			.then(res => (res.ok ? res.json() : null))
			.then(json => {
				if (cancelled) return;
				setLyrics(parseSyncedLyrics(json?.syncedLyrics));
			})
			.catch(() => !cancelled && setLyrics([]));

		return () => {
			cancelled = true;
		};
	}, [track?.id, track?.title, track?.artist, track?.album, track?.duration, vstorage.showLyrics]);
	return lyrics;
}

function SpotifyProfileTheme({ colors }: { colors: ReturnType<typeof hashPalette> }) {
	if (!vstorage.overrideProfileTheme) return null;
	return React.createElement(
		RN.View,
		{
			pointerEvents: "none",
			style: [
				styles.themeWash,
				{ backgroundColor: colors.dark },
			],
		},
		React.createElement(RN.View, { style: [styles.diagonalA, { backgroundColor: colors.base, opacity: 0.9 }] }),
		React.createElement(RN.View, { style: [styles.diagonalB, { backgroundColor: colors.mid, opacity: 0.72 }] }),
		React.createElement(RN.View, { style: [styles.diagonalC, { backgroundColor: colors.soft, opacity: 0.8 }] }),
	);
}

function LyricsBlock({ lyrics, position }: { lyrics: LyricLine[]; position: number }) {
	if (!lyrics.length) return null;
	const active = Math.max(
		0,
		lyrics.findIndex((line, index) =>
			position >= line.time && (!lyrics[index + 1] || position < lyrics[index + 1].time)
		),
	);
	const visible = lyrics.slice(Math.max(0, active - 1), active + 3);
	return React.createElement(
		RN.View,
		{ style: styles.lyrics },
		visible.map(line =>
			React.createElement(
				RN.Text,
				{
					key: `${line.time}-${line.text}`,
					numberOfLines: 1,
					style: [
						styles.lyricLine,
						line === lyrics[active] && styles.activeLyric,
					],
				},
				line.text,
			)
		),
	);
}

function QueueCard({ next, colors }: { next: Track | null; colors: ReturnType<typeof hashPalette> }) {
	if (!vstorage.showQueue) return null;
	return React.createElement(
		RN.View,
		{ style: [styles.queueCard, { backgroundColor: `${colors.dark}` }] },
		next?.art && React.createElement(RN.Image, { source: { uri: next.art }, style: styles.queueArt }),
		React.createElement(RN.Text, { style: styles.queueTitle }, "Up next"),
		React.createElement(
			RN.Text,
			{ numberOfLines: 1, style: styles.queueSong },
			next?.title ?? "Queue hidden by Discord",
		),
		React.createElement(
			RN.Text,
			{ numberOfLines: 1, style: styles.queueArtist },
			next?.artist ?? "The panel will fill this when Spotify exposes the next track.",
		),
	);
}

function SpotifyCard() {
	const { track, next } = useSpotifySnapshot();
	const lyrics = useSyncedLyrics(track);

	if (!track) {
		return React.createElement(
			RN.View,
			{ style: styles.empty },
			React.createElement(RN.Text, { style: styles.emptyText }, "Play something on Spotify to light up your profile."),
		);
	}

	const now = Date.now();
	const duration = track.duration ?? 0;
	const position = track.start ? Math.max(0, Math.min(duration, now - track.start)) : 0;
	const progress = duration ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;
	const colors = hashPalette(`${track.id ?? ""}${track.title}${track.artist}${track.art ?? ""}`);
	const musicIcon = getAssetIDByName("MusicIcon") ?? getAssetIDByName("ic_spotify_white_16px");

	return React.createElement(
		RN.View,
		{ style: [styles.card, { backgroundColor: colors.dark, borderColor: colors.mid }] },
		React.createElement(SpotifyProfileTheme, { colors }),
		React.createElement(RN.View, { style: [styles.diagonalA, { backgroundColor: colors.base, opacity: 0.92 }] }),
		React.createElement(RN.View, { style: [styles.diagonalB, { backgroundColor: colors.mid, opacity: 0.7 }] }),
		React.createElement(RN.View, { style: [styles.diagonalC, { backgroundColor: colors.soft, opacity: 0.78 }] }),
		React.createElement(
			RN.View,
			{ style: styles.content },
			React.createElement(
				RN.View,
				{ style: styles.topRow },
				React.createElement(
					RN.View,
					{ style: styles.artWrap },
					track.art
						? React.createElement(RN.Image, { source: { uri: track.art }, style: styles.art })
						: React.createElement(
							RN.View,
							{ style: styles.artFallback },
							musicIcon && React.createElement(RN.Image, {
								source: musicIcon,
								style: { width: 34, height: 34, tintColor: "#fff" },
							}),
						),
				),
				React.createElement(
					RN.View,
					{ style: styles.info },
					React.createElement(RN.Text, { style: styles.eyebrow }, "Spotify live"),
					React.createElement(RN.Text, { numberOfLines: 1, style: styles.title }, track.title),
					React.createElement(RN.Text, { numberOfLines: 1, style: styles.artist }, track.artist),
				),
			),
			React.createElement(
				RN.View,
				null,
				React.createElement(
					RN.View,
					{ style: styles.seekTrack },
					React.createElement(RN.View, { style: [styles.seekFill, { width: `${progress}%` }] }),
				),
				React.createElement(
					RN.View,
					{ style: styles.rowBetween },
					React.createElement(RN.Text, { style: styles.time }, msToClock(position)),
					React.createElement(RN.Text, { style: styles.time }, duration ? msToClock(duration) : "--:--"),
				),
			),
			React.createElement(QueueCard, { next, colors }),
			React.createElement(LyricsBlock, { lyrics, position }),
		),
	);
}

function ProfileMusicSection(props: { userId?: string; style?: any }) {
	const selfId = UserStore?.getCurrentUser?.()?.id;
	if (props.userId && selfId && props.userId !== selfId) return null;

	if (UserProfileCard) {
		return React.createElement(
			UserProfileCard,
			{ title: "Better Spotify RPC", style: props.style },
			React.createElement(SpotifyCard),
		);
	}
	if (UserProfileSection) {
		return React.createElement(
			UserProfileSection,
			{ title: "Better Spotify RPC" },
			React.createElement(SpotifyCard),
		);
	}
	return React.createElement(SpotifyCard);
}

function patchProfileCard(component: any, variant: "you" | "simplified" | "bio") {
	if (!component?.default) return undefined;
	return after("default", component, (args: any[], ret: any) => {
		const props = args[0] ?? {};
		const userId = props.userId ?? props.displayProfile?.userId;
		const children = [
			React.createElement(ProfileMusicSection, {
				key: "better-spotify-rpc",
				userId,
				style: variant === "simplified" ? props.style : undefined,
			}),
			ret,
		];
		return React.createElement(React.Fragment, {}, children);
	});
}

export function onLoad() {
	vstorage.showLyrics ??= true;
	vstorage.showQueue ??= true;
	vstorage.overrideProfileTheme ??= true;
}

export const onUnload = (() => {
	const patches = [
		patchProfileCard(YouAboutMeCard, "you"),
		patchProfileCard(SimplifiedUserProfileAboutMeCard, "simplified"),
		patchProfileCard(UserProfileAboutMeCard, "simplified"),
		patchProfileCard(UserProfileBio, "bio"),
	].filter(Boolean) as (() => void)[];

	return () => patches.forEach(unpatch => unpatch());
})();

export function settings() {
	if (!TableRowGroup || !TableSwitchRow) {
		return React.createElement(
			RN.View,
			{ style: { padding: 16 } },
			React.createElement(RN.Text, { style: { color: semanticColors.TEXT_NORMAL } }, "Better Spotify RPC is enabled."),
		);
	}

	return React.createElement(
		TableRowGroup,
		{ title: "Better Spotify RPC" },
		React.createElement(TableSwitchRow, {
			label: "Album-art profile theme",
			subLabel: "Tint your profile card around the current Spotify cover.",
			value: vstorage.overrideProfileTheme,
			onValueChange: (value: boolean) => (vstorage.overrideProfileTheme = value),
		}),
		React.createElement(TableSwitchRow, {
			label: "Up next card",
			subLabel: "Show the next Spotify queue item when Discord exposes it.",
			value: vstorage.showQueue,
			onValueChange: (value: boolean) => (vstorage.showQueue = value),
		}),
		React.createElement(TableSwitchRow, {
			label: "Synced lyrics",
			subLabel: "Fetch synced lines from LRCLIB for the current track.",
			value: vstorage.showLyrics,
			onValueChange: (value: boolean) => (vstorage.showLyrics = value),
		}),
		TableRow && React.createElement(TableRow, {
			label: "Spotify support",
			subLabel: "This first build intentionally reads Spotify only.",
		}),
	);
}
