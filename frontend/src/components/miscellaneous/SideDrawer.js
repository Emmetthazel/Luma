import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text, HStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, ChatIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { Icon } from "@chakra-ui/react";
import ThemeSelector from "../ThemeSelector";
import { useTheme } from "../../Context/ThemeProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  const { theme } = useTheme();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setSelectedChat(undefined);
    setChats([]);
    setNotification([]);
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={theme.colors.card}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="1px"
        borderRadius="md"
        boxShadow={`0 2px 12px ${theme.colors.shadow}`}
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            w="30.5%"
            h="37px"
            variant="outline"
            onClick={onOpen}
            bg={theme.colors.input}
            borderColor={theme.colors.border}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            _hover={{ bg: theme.colors.cardHover }}
            _active={{ bg: theme.colors.input }}
            leftIcon={<i className="fas fa-search"></i>}
            px={4}
            py={2}
            fontWeight="normal"
            fontSize="lg"
            display="flex"
            alignItems="center"
            color={theme.colors.text}
          >
            <Text d={{ base: "none", md: "flex" }} px={2}>
              Search Users
            </Text>
          </Button>
        </Tooltip>
        <HStack spacing={4}>
          <Icon
            as={ChatIcon}
            w={6}
            h={6}
            color={theme.colors.primary}
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
          />
          <Text
            fontSize="2xl"
            fontFamily="Work sans"
            fontWeight="bold"
            bgGradient={theme.gradients.primary}
            bgClip="text"
            letterSpacing="wide"
          >
            Luma
          </Text>
        </HStack>
        <HStack spacing={3}>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} color={theme.colors.primary} />
            </MenuButton>
            <MenuList pl={2} bg={theme.colors.card} color={theme.colors.text}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg={theme.colors.card} rightIcon={<ChevronDownIcon color={theme.colors.primary} />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList bg={theme.colors.card} color={theme.colors.text} borderColor={theme.colors.border}>
              <ProfileModal user={user}>
                <MenuItem _hover={{ bg: theme.colors.buttonHover, color: theme.colors.buttonText }}>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} _hover={{ bg: theme.colors.buttonHover, color: theme.colors.buttonText }}>Logout</MenuItem>
            </MenuList>
          </Menu>
          <ThemeSelector />
        </HStack>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
