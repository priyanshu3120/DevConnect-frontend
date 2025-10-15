const Card=({user})=> {
    const {firstName,lastName,photoUrl,about,gender,age,skills}=user;
    return (
        <>
        <div className="card bg-base-300 w-96 shadow-md rounded-xl">
  <figure>
    <img
      src={user.photoUrl}
      alt="photo" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">{firstName +" " +lastName}</h2>
    {gender&& age &&<p>{gender+" , "+age}</p>}
    <p>{about}</p>
    <div className="card-actions justify-center my-4">
      <button className="btn btn-primary">Ignored</button>
      <button className="btn btn-secondary">Interested</button>
    </div>
  </div>
</div>
</>
    )
};

export default Card;