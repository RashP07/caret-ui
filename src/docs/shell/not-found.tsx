import { CompassIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button, Card, CardIcon, CardText, CardTitle } from "@/components";
import { useDocs } from "../docs-context";

export function NotFound() {
  const { openSearch } = useDocs();
  useEffect(() => {
    document.title = "No page here — Caret";
  }, []);
  return (
    <Card empty className="mx-auto mt-16 max-w-[420px]">
      <CardIcon>
        <CompassIcon />
      </CardIcon>
      <CardTitle>There's no page here</CardTitle>
      <CardText>The link may be from an older version of the docs. Search for what you were after, or start from the components.</CardText>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openSearch} kbd="⌘K">
          Search
        </Button>
        <Button variant="primary" nativeButton={false} render={<Link to="/components" />}>
          Browse components
        </Button>
      </div>
    </Card>
  );
}
