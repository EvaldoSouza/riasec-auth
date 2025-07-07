import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";

const Page = async () => {
  const session = await auth();

  return (
    <>
      {session ? (
        // If the user is signed in, show their info and a sign-out button
        <>
          <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
            <p className="text-gray-600">Signed in as:</p>
            <p className="font-medium">{session.user?.email}</p>
          </div>
          <SignOut />
        </>
      ) : (
        // If the user is not signed in, show a message
        <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
          <p className="font-medium text-gray-700">
            You are not signed in. The middleware should have redirected you.
          </p>
        </div>
      )}
    </>
  );
};

export default Page;