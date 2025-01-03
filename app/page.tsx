export const dynamic = 'force-dynamic';

import { RoleSelector } from '@/components/RoleSelector';
import { Welcome } from '@/components/Welcome';
import { checkUser } from '@/app/actions/checkUser';
import { fetchRoomByCreatedBy } from './actions/Room';
import Lobby from '@/components/Lobby';

export default async function Home() {
  try {
    const user = await checkUser();

    if (user) {
      const room = await fetchRoomByCreatedBy(user.email, 'waiting');
      if (room) {
        return (
          <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
            <Lobby />
          </div>
        )
      }
    }

    return (
      <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
        {!user ? <Welcome /> : <RoleSelector />}
      </div>
    );
  } catch (error) {
    console.error('Error in Home page:', error);
    return (
      <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
        <Welcome />
      </div>
    );
  }
}