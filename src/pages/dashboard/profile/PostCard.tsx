import {
    Avatar,
    Box,
    ButtonBase,
    Card,
    IconButton,
    InputBase,
    Typography,
    styled,
    useTheme,
  } from "@mui/material";
  import { FC, MouseEvent } from "react";
  import {
    FaHeart,
    FaRegCommentDots,
    FaShareAlt,
    FaUpload,
    FaEllipsisV,
    FaPaperPlane,
  } from "react-icons/fa";
  
  // component props interface
  interface PostCardProps {
    post: {
      postTitle: string;
      postImage: string;
    };
    handleMore: (event: MouseEvent<HTMLButtonElement>) => void;
  }
  
  // styled components
  const ImageWrapper = styled(Box)(() => ({
    width: 48,
    height: 48,
    overflow: "hidden",
    borderRadius: "50%",
  }));
  
  const PostImageWrapper = styled(Box)(() => ({
    width: "100%",
    marginTop: 16,
    overflow: "hidden",
    borderRadius: "8px",
  }));
  
  const PostCard: FC<PostCardProps> = ({ post, handleMore }) => {
    const theme = useTheme();
  
    return (
      <Card sx={{ padding: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <ImageWrapper>
              <img
                src="/static/user/user-10.png"
                alt="User"
                width="100%"
                height="100%"
              />
            </ImageWrapper>
  
            <Box ml={1}>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                Martha Hawk
              </Typography>
              <Typography variant="caption" color="text.disabled" fontWeight={500}>
                22 June 2020
              </Typography>
            </Box>
          </Box>
  
          <IconButton onClick={handleMore}>
            <FaEllipsisV size={18} color={theme.palette.text.disabled} />
          </IconButton>
        </Box>
  
        <Box mt={3}>
          <Typography variant="body1" fontWeight={600}>
            {post.postTitle}
          </Typography>
  
          {post.postImage && (
            <PostImageWrapper>
              <img src={post.postImage} alt="Post" width="100%" />
            </PostImageWrapper>
          )}
  
          <Box display="flex" alignItems="center" justifyContent="space-between" my={2}>
            {postDetails.map(({ Icon, count }, index) => (
              <ButtonBase key={index}>
                <Box display="flex" alignItems="center">
                  <IconButton size="small">
                    <Icon size={16} color={theme.palette.text.disabled} />
                  </IconButton>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    ml={0.5}
                    fontWeight={500}
                  >
                    {count}
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
  
          <Box display="flex" alignItems="center" py={1}>
            <Avatar
              alt="User"
              src="/static/user/user-10.png"
              sx={{ width: 36, height: 36 }}
            />
  
            <InputBase
              placeholder="Write a comment"
              sx={{
                height: 36,
                px: 2,
                fontSize: 13,
                width: "100%",
                ml: 1,
                fontWeight: 600,
                borderRadius: "8px",
                color: "text.primary",
                backgroundColor:
                  theme.palette.mode === "light" ? "secondary.200" : "divider",
              }}
            />
  
            <IconButton>
              <FaPaperPlane size={18} color={theme.palette.text.disabled} />
            </IconButton>
          </Box>
        </Box>
      </Card>
    );
  };
  
  const postDetails = [
    { Icon: FaHeart, count: 150 },
    { Icon: FaRegCommentDots, count: 15 },
    { Icon: FaUpload, count: 15 },
    { Icon: FaShareAlt, count: 12 },
  ];
  
  export default PostCard;
  