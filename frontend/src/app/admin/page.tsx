import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SamplePage() {
  return (
    <main className="py-12 space-y-16">

      <section className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl">Landing Page</h1>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader>
            <CardTitle>This Website Is Under Development</CardTitle>
            <CardDescription>
              Something new is on the way. Check back soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>We are building and polishing everything. Thanks for your patience.</p>
          </CardContent>
          <CardFooter>
            <p>
              For more details, you can contact the lead developer at{" "}
              <a
                href="mailto:charleshenrytinoy8@gmail.com"
                className="underline underline-offset-4"
              >
                charleshenrytinoy8@gmail.com
              </a>
            </p>
          </CardFooter>
        </Card>
      </section>

    </main>
  );
}