import React from 'react';
import { DataTable } from './_components/DataTable';
import { columns } from './_components/Columns';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';


const CoursesPage = async() => {

  const {userId} = auth()

  if(!userId){
    return redirect("/")
  }

  const data= await db.course.findMany({
    where : { 
      userId,
    }, orderBy : {
      createdAt : "desc"
    }
  })

  return (
    <div className="p-6">
     <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CoursesPage;
