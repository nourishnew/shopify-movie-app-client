import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import { useState } from "react";
import HomeIcon from "@material-ui/icons/Home";

import useFormInput from "./hooks/useFormInput";
import { useSnackbar } from "notistack";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import {
	CircularProgress,
	Button,
	makeStyles,
	withStyles,
	fade,
} from "@material-ui/core";
import NominationView from "./NominationView";

const StyledCircularProgress = withStyles((theme) => ({
	root: {
		color: "blue",
		display: "block",
		margin: "auto",
		marginTop: "10%",
		height: "75px",
		width: "75px",
	},
}))(CircularProgress);

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 345,
		marginTop: "20px",
		margin: "2em",
	},
	search: {
		position: "relative",
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		"&:hover": {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			marginLeft: theme.spacing(3),
			width: "auto",
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: "100%",
		position: "absolute",
		pointerEvents: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	inputRoot: {
		color: "inherit",
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("md")]: {
			width: "20ch",
		},
	},
	scroll: {
		overflowY: "auto",
		"&::-webkit-scrollbar": {
			width: "3px",
		},
		"&::-webkit-scrollbar-track": {
			"-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
		},
		"&::-webkit-scrollbar-thumb": {
			backgroundColor: "rgba(0,0,0,.1)",
			borderRadius: "2px",
		},
	},
}));

export default function MovieApp({}) {
	const [searchLoading, setSearchLoading] = useState(false);
	const [fav, setFav] = useState([]);
	const [movieList, setMovieList] = useState([]);
	const keyword = useFormInput();
	const [error, setError] = useState(false);

	const { enqueueSnackbar } = useSnackbar();

	function handleAddNomination(id) {
		setFav((prevItems) => [...prevItems, id]);
		enqueueSnackbar("Movie has been added to your Watch list", {
			variant: "success",
		});
	}

	function handleDeleteNomination(id) {
		setFav((prevItems) => prevItems.filter((item) => item !== id));
		enqueueSnackbar("Movie has been removed from your Watch list", {
			variant: "success",
		});
	}

	async function handleSearch(word) {
		setError(false);
		setMovieList([]);
		if (!word || word.length === 0) {
			enqueueSnackbar(
				"Please type a keyword in the search bar and click search",
				{
					variant: "error",
				}
			);

			return;
		}
		setSearchLoading(true);
		axios
			.get("https://www.omdbapi.com/?s=" + word + "&apikey=34bf0bd1")
			.then((response) => {
				if (response.data.Response === "False") {
					setError(response.data.Error);
					enqueueSnackbar(
						"Error while fetching movies. Please type something specific and clear",
						{
							variant: "error",
						}
					);
				} else {
					setMovieList(response.data.Search);
				}
				setSearchLoading(false);
			})
			.catch((error) => console.log(error));
	}
	const classes = useStyles();

	return (
		<div>
			<div>
				<AppBar position="static">
					<Toolbar>
						<IconButton
							edge="start"
							className={classes.menuButton}
							color="inherit"
							aria-label="menu"
							onClick={() => {
								setMovieList([]);
								setError(false);
							}}>
							<HomeIcon />
						</IconButton>
						<Typography
							variant="h6"
							className={classes.title}
							onClick={() => setMovieList([])}>
							Home
						</Typography>
						<div className={classes.search}>
							<div className={classes.searchIcon}>
								<SearchIcon />
							</div>
							<InputBase
								placeholder="Search movie"
								value={keyword.value}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleSearch(keyword.value);
									}
								}}
								classes={{
									root: classes.inputRoot,
									input: classes.inputInput,
								}}
								style={{ width: "80%", marginLeft: "auto" }}
								onChange={keyword.onChange}
								inputProps={{ "aria-label": "search" }}
							/>
						</div>
						<Button
							variant="contained"
							color="secondary"
							onClick={() => handleSearch(keyword.value)}>
							Search
						</Button>
					</Toolbar>
				</AppBar>

				<div style={{ display: "flex", flexDirection: "row" }}>
					<div className="movieContainer">
						{searchLoading ? (
							<StyledCircularProgress />
						) : error ? (
							<p className="errorText">{error}</p>
						) : movieList && movieList.length === 0 ? (
							<div style={{ width: "100%" }}>
								<h1>Search for movies</h1>
								{fav && fav.length === 0 ? (
									<div>
										<p>You have 0 movies in your Watch List.</p>
										<p>Watch List will be displayed on the right side</p>
									</div>
								) : null}
							</div>
						) : (
							<div>
								<div className="itemsContainer">
									{movieList &&
										movieList.map((movie, index) => {
											return (
												<Card className={classes.root}>
													<CardActionArea>
														<CardMedia
															component="img"
															alt="Contemplative Reptile"
															height="350"
															image={movie.Poster}
															title="Contemplative Reptile"
														/>
														<CardContent>
															<Typography
																gutterBottom
																variant="h5"
																component="h2">
																{movie.Title}
															</Typography>
															<Typography
																variant="body2"
																color="textSecondary"
																component="p">
																{movie.Year}
															</Typography>
														</CardContent>
													</CardActionArea>
													<CardActions>
														<Button
															disabled={fav.includes(movie.imdbID)}
															variant="contained"
															color="primary"
															onClick={() => handleAddNomination(movie.imdbID)}>
															Add to watch list
														</Button>
													</CardActions>
												</Card>
											);
										})}
								</div>
							</div>
						)}
					</div>
					{fav && fav.length > 0 ? (
						<div className="nominationContainer">
							<h1>My Watch List</h1>

							{fav
								? fav.map((id) => {
										return (
											<NominationView
												id={id}
												handleDeleteNomination={handleDeleteNomination}
											/>
										);
								  })
								: null}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
