
import axios from 'axios';

async function testSteamSpyTag() {
  try {
    console.log("Testing SteamSpy request=tag&tag=Indie...");
    const { data } = await axios.get('https://steamspy.com/api.php?request=tag&tag=Indie', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' 
      },
      timeout: 10000
    });
    console.log(`Success! Entries: ${Object.keys(data).length}`);
    console.log("Sample:", Object.values(data)[0]);
  } catch (error) {
    console.error("SteamSpy failed:", error.message);
    if (error.response) console.error("Status:", error.response.status);
  }
}

testSteamSpyTag();
