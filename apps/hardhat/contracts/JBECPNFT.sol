// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JBECPPUPNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    uint256 private _eventIds;

    struct Event {
        string name;
        string description;
        string image;
        string eventName;
        string date;
        bool exists;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public tokenToEvent; // tokenId => eventId

    event EventCreated(
        uint256 indexed eventId,
        string name,
        string eventName,
        string date
    );
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed eventId
    );
    event EventUpdated(uint256 indexed eventId, string field, string value);

    constructor()
        ERC721("JBECP PUP on Base", "JBECPPUPBASE")
        Ownable(msg.sender)
    {}

    function mint(uint256 eventId, address to) external {
        require(events[eventId].exists, "Event does not exist");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(to, newTokenId);

        tokenToEvent[newTokenId] = eventId;

        emit NFTMinted(to, newTokenId, eventId);
    }

    function createEvent(
        string memory name,
        string memory description,
        string memory image,
        string memory eventName,
        string memory date
    ) external onlyOwner returns (uint256) {
        _eventIds++;
        uint256 eventId = _eventIds;

        events[eventId] = Event({
            name: name,
            description: description,
            image: image,
            eventName: eventName,
            date: date,
            exists: true
        });

        emit EventCreated(eventId, name, eventName, date);
        return eventId;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function totalEvents() external view returns (uint256) {
        return _eventIds;
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].exists, "Event does not exist");
        return events[eventId];
    }

    function getTokenEvent(
        uint256 tokenId
    ) external view returns (Event memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 eventId = tokenToEvent[tokenId];
        require(events[eventId].exists, "Event does not exist");
        return events[eventId];
    }

    // =============================================================
    //                          OVERRIDES
    // =============================================================

    /**
     * @notice Returns the URI for a specific token ID.
     * @dev Encodes the metadata as a base64 JSON string.
     * @param tokenId The token ID for which the URI is generated.
     * @return A base64-encoded JSON string representing the token URI.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );

        bytes memory metadata = abi.encodePacked(getMetadata(tokenId));
        return
            string(abi.encodePacked("data:application/json;utf8,", metadata));
    }

    /**
     * @notice Generates the metadata JSON for a specific token ID.
     * @param tokenId The token ID for which metadata is generated.
     * @return A JSON string representing the token metadata.
     */
    function getMetadata(
        uint256 tokenId
    ) internal view returns (string memory) {
        uint256 eventId = tokenToEvent[tokenId];
        Event memory eventData = events[eventId];

        return
            string(
                abi.encodePacked(
                    "{",
                    '"name": "',
                    eventData.name,
                    " #",
                    _toString(tokenId),
                    '",',
                    '"description": "',
                    eventData.description,
                    '",',
                    '"image": "',
                    eventData.image,
                    '",',
                    '"attributes": [',
                    "{",
                    '"trait_type": "Event",',
                    '"value": "',
                    eventData.eventName,
                    '"',
                    "},",
                    "{",
                    '"trait_type": "Date",',
                    '"value": "',
                    eventData.date,
                    '"',
                    "}",
                    "]",
                    "}"
                )
            );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
