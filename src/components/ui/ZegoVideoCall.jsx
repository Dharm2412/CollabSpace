import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

// get token
function generateToken(tokenServerUrl, appID, userID) {
  // Obtain the token interface provided by the App Server
  return fetch(tokenServerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appID,
      user_id: userID,
    }),
  }).then(async (res) => {
    const result = await res.text();
    return result;
  });
}

export default function ZegoVideoCall({ roomId, username }) {
  // Use provided roomId or generate one, use provided username or generate one
  const videoRoomID = roomId || randomID(5);
  const userID = randomID(5);
  const userName = username || randomID(5);
  
  let myMeeting = async (element) => {
    // generate token
    const token = await generateToken(
      'https://mini-game-test-server.zego.im/api/token',
      2013980891,
      userID
    );

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      2013980891,
      token,
      videoRoomID,
      userID,
      userName
    );
    // create instance object from token
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
    });
  };

  return (
    <div className="w-full h-screen bg-black">
      <div
        ref={myMeeting}
        style={{ width: '100%', height: '100%' }}
      ></div>
    </div>
  );
}
