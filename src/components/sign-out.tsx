//"use client";
import { Button } from "@/components/ui/button";
//import { signOut } from "next-auth/react";
import { signOut } from "@/lib/auth"; //Por que não pode ser esse? sei lá, essa bosta é uma bosta -> por que é só server side
import { executeAction } from "@/lib/executeAction";

/* Se utilizar esse signOut da next-auth/react, volta a ter o problema de 404 em chamada de api
ele parece ser o usado para tratar as coisas em client, mas usando o do auth.js, que é server side, funciona bem */

const SignOut = () => {
  return (
    <div className="flex justify-center">
      <form
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        action={async (formData: FormData) => {
          "use server";
          await executeAction({
            actionFn: async () => {
              await signOut();
            },
          });
        }}
      >
        <Button variant="destructive" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  );
};

export { SignOut };
